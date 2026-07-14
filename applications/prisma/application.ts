import {
  AstFieldGenerator,
  GlobalDefinitionRegistry,
  LocalDefinitionRegistry,
} from '@supschema/codegen-utils/astGeneration/common.js';
import {
  currentNode,
  generateNode,
  generateRoot,
  withRegistry,
} from '@supschema/codegen-utils/astGeneration/dynamicTree.js';
import { getRegistry } from '@supschema/codegen-utils/astGeneration/registry.js';
import {
  Model as PrismaModel,
  Field,
  Enum,
  Comment,
  printSchema,
  Value,
  Block,
  Assignment,
  Attribute,
  Type,
  Property,
  AttributeArgument,
  Break,
} from '@mrleebo/prisma-ast';
import { capitalize, groupBy, mapValues, pickBy } from 'remeda';
import { computed } from '@vue/reactivity';
import { Model, ModelRelation } from '@supschema/model-types';
import type { S } from '@supschema/common-types';
import Nullable from '@supschema/common-types/Nullable.js';

export type PrismaField = Omit<Field, 'name' | 'type'> & { description?: string };
export type PrismaType = Omit<PrismaModel | Enum | Type, 'name'> & { description?: string };
export type PrismaObjectContent = Property | Comment | Break;

export interface PrismaExtension<T extends boolean = true> {
  $prisma: T extends true ? AstFieldGenerator<PrismaField, this> : undefined;
}
export type PrismaExtended = { $prisma: AstFieldGenerator<PrismaField> };

export const extendWithDbAttribute = (getName: () => string | undefined, field: PrismaField): PrismaField => {
  const name = getName();
  if (!name) return field;
  return {
    ...field,
    attributes: [{ type: 'attribute', kind: 'field', group: 'db', name }, ...(field.attributes ?? [])],
  };
};

export const genPrismaField = (key: string, schema: PrismaExtended): PrismaField =>
  generateNode(key, { nameSuffix: currentNode.context.nameSuffix + capitalize(key) }, () => {
    const base = getRegistry(GlobalDefinitionRegistry).getBaseRef(schema);
    const baseRef = base && {
      schema: base.baseSchema,
      get ref() {
        return base.path.at(-1)!;
      },
    };

    return schema.$prisma(baseRef);
  });

export const genPrismaProperties = (properties: Record<string, PrismaExtended>): PrismaObjectContent[] =>
  Object.entries(properties).flatMap(([key, schema]) => {
    const field = genPrismaField(key, schema);
    return [
      ...(field.description ? [{ type: 'comment' as const, text: field.description }] : []),
      {
        name: key,
        type: 'field' as const,
        ...genPrismaField(key, schema),
      },
    ];
  });

export const catchDefinitions = <T>(fn: () => T) => {
  const { result, registry } = withRegistry(LocalDefinitionRegistry, fn);
  return {
    result,
    definitions: mapValues(Object.fromEntries(registry.definitions.entries()), (d) => d[1] as PrismaType),
  };
};

export const define = (namePostfix: string, fn: (name: string) => PrismaType): string => {
  const c = currentNode;
  const { definitions } = getRegistry(LocalDefinitionRegistry);
  const name = computed(() => {
    const baseName = c.context.nameSuffix + capitalize(namePostfix);
    let name = baseName;
    let i = 1;
    while (definitions.get(name) && definitions.get(name)?.[0] !== c) {
      name = baseName + i++;
    }

    return name;
  }).value;

  const definition = generateNode(name, { scopePath: [...currentNode.context.scopePath, name], nameSuffix: '' }, () =>
    fn(name),
  );
  getRegistry(LocalDefinitionRegistry).register(name, currentNode, definition);
  return name;
};

export type PrismaExtendedProperties = { [K: string]: S.DataValue & PrismaExtended };
export type PrismaExtendedModel = Model<string, PrismaExtendedProperties>;
export type RootDefinitionSchemas = Model<string, PrismaExtendedProperties> | PrismaExtended;
export type RootSchemas = RootDefinitionSchemas | ModelRelation;
export type RelationMap = Record<string, ModelRelation[]>;
export type RelationMaps = Record<'direct' | 'reverse', RelationMap>;

export const generateModelProperties = (
  schema: PrismaExtendedModel,
  relationMaps: RelationMaps,
): PrismaModel['properties'] => {
  const properties: PrismaObjectContent[] = genPrismaProperties(schema.properties);
  if (schema.key.length === 1) {
    const keyProp = properties.find((p): p is Field => p.type === 'field' && p.name === schema.key[0]);
    if (!keyProp) throw new Error(`Key property ${schema.key[0]} is not found`);
    keyProp.attributes ??= [];
    keyProp.attributes?.push({ type: 'attribute', kind: 'field', name: 'id' });
  }

  const directRelations = relationMaps.direct[schema.name] ?? [];
  const reverseRelations = relationMaps.reverse[schema.name] ?? [];
  const allRelations = [...directRelations.map((r) => r.model), ...reverseRelations.map((r) => r.otherModel)];
  const toModelRelationCounts = mapValues(
    groupBy(allRelations, (m) => m.name),
    (g) => g.length,
  );
  for (const rel of directRelations) {
    const relationArgs: AttributeArgument[] = Object.entries({
      ...(rel.fields.length && { fields: rel.fields }),
      ...(rel.otherFields.length && { references: rel.otherFields }),
      ...(rel.onDelete && { onDelete: rel.onDelete }),
      ...(rel.map && { map: rel.map }),
    }).map(([key, value]) => ({
      type: 'attributeArgument',
      value: { type: 'keyValue', key, value: Array.isArray(value) ? { type: 'array', args: value } : value },
    }));
    if ((toModelRelationCounts[rel.model.name] ?? 0) > 1)
      relationArgs.unshift({ type: 'attributeArgument', value: `"${rel.name}"` });

    const attributes: Attribute[] = [];
    if (relationArgs.length)
      attributes.push({ type: 'attribute', kind: 'field', name: 'relation', args: relationArgs });

    properties.push({
      type: 'field',
      name: rel.name,
      fieldType: rel.otherModel.name,
      attributes,
      optional: rel.fields.some((f) => rel.model.properties[f] instanceof Nullable),
      array:
        !rel.fields.every((f) => rel.model.properties[f].unique) &&
        rel.otherFields.some((f) => !rel.otherModel.key.includes(f)) &&
        !rel.otherModel.uniques?.some((u) => !u.where && rel.otherFields.some((f) => !u.fields.includes(f))),
    });
  }
  for (const rel of reverseRelations) {
    const attributes: Attribute[] = [];
    if ((toModelRelationCounts[rel.otherModel.name] ?? 0) > 1) {
      attributes.push({
        type: 'attribute',
        kind: 'field',
        name: 'relation',
        args: [
          {
            type: 'attributeArgument',
            value: `"${rel.name}"`,
          },
        ],
      });
    }
    properties.push({
      type: 'field',
      name: rel.otherName,
      fieldType: rel.model.name,
      attributes,
      optional: true,
      array:
        !rel.fields.every((f) => rel.model.key.includes(f)) &&
        !rel.model.uniques?.some((u) => !u.where && rel.fields.some((f) => !u.fields.includes(f))),
    });
  }

  if (schema.key.length > 1)
    properties.push({
      type: 'attribute',
      kind: 'object',
      name: 'id',
      args: [{ type: 'attributeArgument', value: { type: 'array', args: schema.key } }],
    });

  for (const u of schema.uniques ?? []) {
    properties.push({
      type: 'attribute',
      kind: 'object',
      name: 'unique',
      args: [
        { type: 'attributeArgument', value: { type: 'array', args: u.fields } },
        ...(u.where
          ? [
              {
                type: 'attributeArgument' as const,
                value: { type: 'function' as const, name: 'raw', params: [u.where] },
              },
            ]
          : []),
      ],
    });
  }
  for (const u of schema.indexes ?? []) {
    properties.push({
      type: 'attribute',
      kind: 'object',
      name: 'index',
      args: [
        { type: 'attributeArgument', value: { type: 'array', args: u.fields } },
        ...(u.where
          ? [
              {
                type: 'attributeArgument',
                value: { type: 'function', name: 'raw', params: [u.where] },
              } satisfies AttributeArgument,
            ]
          : []),
      ],
    });
  }

  if (schema.dbSchema)
    properties.push({
      type: 'attribute',
      kind: 'object',
      name: 'schema',
      args: [{ type: 'attributeArgument', value: schema.dbSchema }],
    });

  return properties;
};

export const generateObjectDescription = (schema: S.DataValue) =>
  [' ', schema.title, ...(schema.description?.split('\n') ?? [])].filter(Boolean).join('\n/// ').replace(/^\s+/, '');

export const generatePrismaSchemaAst = (schemas: Record<string, RootDefinitionSchemas>, relationMaps: RelationMaps) => {
  const { definitions } = catchDefinitions(() => {
    for (const [name, schema] of Object.entries(schemas)) {
      generateNode(name, {}, () => {
        if (schema instanceof Model) {
          define(name, () => ({
            type: 'model',
            name,
            properties: generateModelProperties(schema, relationMaps),
            description: generateObjectDescription(schema),
          }));
        } else genPrismaField(name, schema);
        getRegistry(GlobalDefinitionRegistry).register(schema, [...currentNode.context.scopePath, name]);
      });
    }
  });

  return Object.entries(definitions).flatMap(([name, type]) => {
    return [
      ...(type.description ? [{ type: 'comment' as const, text: type.description } satisfies Comment] : []),
      { name, ...type } as Enum | PrismaModel,
    ];
  });
};

export const generatePrismaSchemasAst = (files: Record<string, Record<string, RootSchemas>>) => {
  const relations = Object.values(files).flatMap((schemas) =>
    Object.values(schemas).filter((s): s is ModelRelation => s instanceof ModelRelation),
  );
  const relationMaps = {
    direct: groupBy(relations, (r) => r.model.name),
    reverse: groupBy(relations, (r) => r.otherModel.name),
  };

  return generateRoot(
    () =>
      withRegistry(GlobalDefinitionRegistry, () =>
        mapValues(files, (schemas, path) =>
          generateNode(path, { scopePath: [path] }, () =>
            generatePrismaSchemaAst(
              pickBy(schemas, (s): s is RootDefinitionSchemas => !(s instanceof ModelRelation)),
              relationMaps,
            ),
          ),
        ),
      ).result,
  );
};

export type DatabaseConnector = 'sqlite' | 'postgresql' | 'mysql' | 'sqlserver' | 'mongodb' | 'cockroachdb';
export interface DataSource {
  provider: DatabaseConnector;
  [K: string]: Value;
}
export interface Generator {
  provider: string;
  [K: string]: Value;
}

export let dbConnector: DatabaseConnector;
const genAssignments = (values: Record<string, Value>): Assignment[] =>
  Object.entries(values).map(([k, v]) => ({ type: 'assignment', key: k, value: typeof v === 'string' ? `"${v}"` : v }));

export const generatePrismaSchemas = (
  opts: { datasource: DataSource; generators: Record<string, Generator> },
  files: Record<string, Record<string, RootSchemas>>,
) => {
  dbConnector = opts.datasource.provider;

  const fileAsts: Record<string, Block[]> = generatePrismaSchemasAst(files);
  fileAsts['schema.prisma'] = [
    {
      type: 'datasource',
      name: 'db',
      assignments: genAssignments(opts.datasource),
    },
    ...Object.entries(opts.generators).map(([name, values]) => ({
      type: 'generator' as const,
      name,
      assignments: genAssignments(values),
    })),
    ...(fileAsts['schema.prisma'] ?? []),
  ];
  return mapValues(fileAsts, (ast) =>
    printSchema({
      type: 'schema',
      list: ast,
    }),
  );
};
