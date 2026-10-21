import { Children, OutputDirectory, Refkey, refkey, render, stc } from '@alloy-js/core';
import { Indent, List, Output, StatementList } from '@alloy-js/core/stc';
import * as ts from '@alloy-js/typescript/stc';
import { createPackage } from '@alloy-js/typescript';
import { capitalize, groupBy, isDefined, isEmpty, mapKeys, pickBy } from 'remeda';
import { extractOptionsModification, Schema } from '@supschema/core';
import { Model, ModelRelation, ReferentialAction } from '@supschema/model-types';
import type { S } from '@supschema/common-types';
import Enum from '@supschema/common-types/Enum.js';
import Nullable from '@supschema/common-types/Nullable.js';
import Array from '@supschema/common-types/Array.js';
import { writeFiles } from '@supschema/codegen-utils/fs.js';

export type DrizzleDialect = 'postgresql' | 'mysql' | 'sqlite';

export interface DrizzleColumn {
  /** Column builder function, e.g. a reference to `text` from the dialect core module */
  builder: Children;
  /** Arguments passed to the builder function as JS values */
  args?: unknown[];
  /** Additional method calls appended to the builder call, e.g. `.array()` */
  modifiers?: Children[];
  nullable?: boolean;
  unique?: boolean;
  title?: string;
  description?: string;
}

export interface DrizzleExtension<T extends boolean = true> {
  $drizzle: T extends true ? () => DrizzleColumn : undefined;
}
export type DrizzleExtended = { $drizzle: () => DrizzleColumn };

export type DrizzleExtendedProperties = { [K: string]: S.DataValue & DrizzleExtended };
export type DrizzleExtendedModel = Model<string, DrizzleExtendedProperties>;
export type RootDefinitionSchemas = DrizzleExtendedModel | DrizzleExtended;
export type RootSchemas = RootDefinitionSchemas | ModelRelation;

const coreExports = ['customType', 'foreignKey', 'index', 'primaryKey', 'unique', 'uniqueIndex'];
const drizzlePackages = {
  orm: createPackage({ name: 'drizzle-orm', version: '', descriptor: { '.': { named: ['relations', 'sql'] } } }),
  postgresql: createPackage({
    name: 'drizzle-orm/pg-core',
    version: '',
    descriptor: {
      '.': {
        named: [
          ...coreExports,
          'pgTable',
          'pgEnum',
          'pgSchema',
          'bigint',
          'boolean',
          'doublePrecision',
          'integer',
          'jsonb',
          'numeric',
          'real',
          'smallint',
          'text',
          'varchar',
        ],
      },
    },
  }),
  mysql: createPackage({
    name: 'drizzle-orm/mysql-core',
    version: '',
    descriptor: {
      '.': {
        named: [
          ...coreExports,
          'mysqlTable',
          'mysqlEnum',
          'mysqlSchema',
          'bigint',
          'boolean',
          'double',
          'float',
          'int',
          'json',
          'smallint',
          'text',
          'tinyint',
          'varchar',
        ],
      },
    },
  }),
  sqlite: createPackage({
    name: 'drizzle-orm/sqlite-core',
    version: '',
    descriptor: { '.': { named: [...coreExports, 'sqliteTable', 'blob', 'integer', 'real', 'text'] } },
  }),
};

export let dialect: DrizzleDialect;

export const byDialect = <T>(values: Record<DrizzleDialect, T>): T => values[dialect];

/** Reference to an export of the current dialect's core module, e.g. `drizzle-orm/pg-core` */
export const drizzleRef = (name: string): Refkey => {
  const ref = (drizzlePackages[dialect] as unknown as Record<string, Refkey | undefined>)[name];
  if (!ref) throw new Error(`Export ${name} is not registered for ${dialect} dialect`);
  return ref;
};
const ormRef = (name: 'relations' | 'sql') => drizzlePackages.orm[name];

export const column = (builder: string, ...args: unknown[]): DrizzleColumn => ({ builder: drizzleRef(builder), args });

export const jsonColumn = () =>
  byDialect({
    postgresql: () => column('jsonb'),
    mysql: () => column('json'),
    sqlite: () => column('text', { mode: 'json' }),
  })();

/** Inline custom type for binary data, as `bytea`/`blob` are not provided by every dialect core */
export const customTypeColumn = (dataType: string): DrizzleColumn => ({
  builder: [
    drizzleRef('customType'),
    '<{ data: Buffer }>(',
    ts.ObjectExpression().children(ts.ObjectProperty({ name: 'dataType', value: `() => ${JSON.stringify(dataType)}` })),
    ')',
  ],
});

const enumRefs = new Map<Schema, Refkey>();
export const getEnumRef = (schema: Schema): Refkey => {
  let s: Schema | undefined = schema;
  while (s) {
    const ref = enumRefs.get(s);
    if (ref) return ref;
    s = extractOptionsModification(s)?.originalSchema;
  }

  throw new Error('Enum is not defined');
};

const dbSchemaRefs = new Map<string, Refkey>();
const getDbSchemaRef = (name: string) => {
  let ref = dbSchemaRefs.get(name);
  if (!ref) dbSchemaRefs.set(name, (ref = refkey()));
  return ref;
};

const member = (obj: Children, key: string): Children =>
  /^[A-Za-z_$][\w$]*$/.test(key) ? [obj, '.', key] : [obj, '[', JSON.stringify(key), ']'];

const call = (target: Children, args: Children[] = []) => ts.FunctionCallExpression({ target, args });

const jsDoc = (lines: (string | undefined)[]) => {
  const doc = lines.filter(Boolean).join('\n\n');
  return doc || undefined;
};

const withDoc = (doc: string | undefined, children: Children): Children =>
  doc ? List({ hardline: true, children: [ts.JSDoc({ children: doc }), children] }) : children;

const arrayExpression = (items: Children[]) =>
  ['[', List({ comma: true, space: true, children: items }), ']'] satisfies Children;

const multilineArrayExpression = (items: Children[]) =>
  [
    '[',
    Indent({ trailingBreak: true }).children(
      List({ comma: true, hardline: true, enderPunctuation: true, children: items }),
    ),
    ']',
  ] satisfies Children;

const referentialActions: Record<ReferentialAction, string> = {
  Cascade: 'cascade',
  Restrict: 'restrict',
  NoAction: 'no action',
  SetNull: 'set null',
  SetDefault: 'set default',
};

export type RelationMap = Record<string, ModelRelation[]>;
export type RelationMaps = Record<'direct' | 'reverse', RelationMap>;

/** Returns true when the fields are guaranteed to identify at most one row of the model */
const isUniqueFieldSet = (model: Model, fields: string[]) =>
  model.key.every((k) => fields.includes(k as string)) ||
  (fields.length === 1 && 'unique' in model.properties[fields[0]] && !!model.properties[fields[0]].unique) ||
  !!model.uniques?.some((u) => !u.where && u.fields.every((f) => fields.includes(f as string)));

const generateEnumDeclaration = (name: string, schema: S.Enum) =>
  ts.VarDeclaration({
    export: true,
    name,
    refkey: getEnumRef(schema),
    doc: jsDoc([schema.title, schema.description]),
    initializer: call(schema.dbSchema ? member(getDbSchemaRef(schema.dbSchema), 'enum') : drizzleRef('pgEnum'), [
      ts.ValueExpression({ jsValue: name }),
      ts.ValueExpression({ jsValue: Object.keys(schema.values) }),
    ]),
  });

/** Enums used by model columns, which are not defined as root schemas and require own pgEnum declaration */
const collectInlineEnums = (modelName: string, schema: DrizzleExtendedModel) => {
  const enums: [string, S.Enum][] = [];
  for (const [key, prop] of Object.entries(schema.properties)) {
    let s: Schema = prop;
    while (s instanceof Nullable || s instanceof Array) s = s instanceof Nullable ? s.schema : s.items;
    if (!(s instanceof Enum)) continue;

    try {
      getEnumRef(s);
    } catch {
      enums.push([modelName + capitalize(key), s]);
      enumRefs.set(s, refkey());
    }
  }

  return enums;
};

const generateColumn = (key: string, schema: S.DataValue & DrizzleExtended, isKey: boolean) => {
  const col = schema.$drizzle();
  const value = [
    call(
      col.builder,
      (col.args ?? []).map((a) => ts.ValueExpression({ jsValue: a })),
    ),
    ...(col.modifiers ?? []),
    isKey ? '.primaryKey()' : col.nullable ? '' : '.notNull()',
    col.unique ? '.unique()' : '',
  ];

  return withDoc(jsDoc([col.title, col.description]), ts.ObjectProperty({ name: key, value }));
};

const generateTableExtras = (schema: DrizzleExtendedModel, directRelations: ModelRelation[]) => {
  const columns = (fields: (string | number | symbol)[]) => fields.map((f) => member('t', f as string));
  const indexName = (fields: (string | number | symbol)[], suffix: string) =>
    [schema.name, ...fields, suffix].join('_');
  const where = (sql: string | undefined): Children => {
    if (!sql) return '';
    if (dialect === 'mysql') throw new Error('Partial indexes are not supported by MySQL');
    return ['.where(', call(member(ormRef('sql'), 'raw'), [ts.ValueExpression({ jsValue: sql })]), ')'];
  };

  const extras: Children[] = [];
  if (schema.key.length > 1)
    extras.push(
      call(drizzleRef('primaryKey'), [
        ts
          .ObjectExpression()
          .children(ts.ObjectProperty({ name: 'columns', value: arrayExpression(columns(schema.key)) })),
      ]),
    );

  for (const u of schema.uniques ?? []) {
    const name = ts.ValueExpression({ jsValue: indexName(u.fields, 'key') });
    extras.push([
      call(drizzleRef(u.where ? 'uniqueIndex' : 'unique'), [name]),
      '.on(',
      List({ comma: true, space: true, children: columns(u.fields) }),
      ')',
      where(u.where),
    ]);
  }

  for (const i of schema.indexes ?? []) {
    extras.push([
      call(drizzleRef('index'), [ts.ValueExpression({ jsValue: indexName(i.fields, 'idx') })]),
      '.on(',
      List({ comma: true, space: true, children: columns(i.fields) }),
      ')',
      where(i.where),
    ]);
  }

  for (const rel of directRelations) {
    extras.push([
      call(drizzleRef('foreignKey'), [
        ts.ObjectExpression().children(
          List({
            comma: true,
            hardline: true,
            enderPunctuation: true,
            children: [
              ts.ObjectProperty({ name: 'columns', value: arrayExpression(columns(rel.fields)) }),
              ts.ObjectProperty({
                name: 'foreignColumns',
                // Referencing the table itself in its own initializer breaks type inference
                value: arrayExpression(
                  rel.otherModel === rel.model
                    ? columns(rel.otherFields)
                    : rel.otherFields.map((f) => member(refkey(rel.otherModel), f)),
                ),
              }),
              ...(rel.map ? [ts.ObjectProperty({ name: 'name', jsValue: rel.map })] : []),
            ],
          }),
        ),
      ]),
      rel.onDelete ? `.onDelete(${JSON.stringify(referentialActions[rel.onDelete])})` : '',
      rel.onUpdate ? `.onUpdate(${JSON.stringify(referentialActions[rel.onUpdate])})` : '',
    ]);
  }

  return extras;
};

const generateTableDeclaration = (name: string, schema: DrizzleExtendedModel, relationMaps: RelationMaps) => {
  const tableFn = schema.dbSchema
    ? member(getDbSchemaRef(schema.dbSchema), 'table')
    : drizzleRef(byDialect({ postgresql: 'pgTable', mysql: 'mysqlTable', sqlite: 'sqliteTable' }));
  const extras = generateTableExtras(schema, relationMaps.direct[schema.name] ?? []);

  return ts.VarDeclaration({
    export: true,
    name,
    refkey: refkey(schema),
    doc: jsDoc([schema.title, schema.description]),
    initializer: call(tableFn, [
      ts.ValueExpression({ jsValue: schema.name }),
      ts.ObjectExpression().children(
        List({
          comma: true,
          hardline: true,
          enderPunctuation: true,
          children: Object.entries(schema.properties).map(([key, prop]) =>
            generateColumn(key, prop, schema.key.length === 1 && schema.key[0] === key),
          ),
        }),
      ),
      ...(extras.length ? [['(t) => ', multilineArrayExpression(extras)]] : []),
    ]),
  });
};

const generateRelationsDeclaration = (name: string, schema: DrizzleExtendedModel, relationMaps: RelationMaps) => {
  const directRelations = relationMaps.direct[schema.name] ?? [];
  const reverseRelations = relationMaps.reverse[schema.name] ?? [];
  if (!directRelations.length && !reverseRelations.length) return;

  const pairKey = (r: ModelRelation) => [r.model.name, r.otherModel.name].sort((a, b) => a.localeCompare(b)).join('\0');
  const pairCounts = groupBy([...directRelations, ...reverseRelations], pairKey);
  const relationName = (r: ModelRelation) =>
    (pairCounts[pairKey(r)]?.length ?? 0) > 1 || r.model === r.otherModel ? { relationName: r.name } : {};

  const helpers = new Set<'one' | 'many'>();
  const properties: Children[] = [];
  for (const rel of directRelations) {
    helpers.add('one');
    properties.push(
      ts.ObjectProperty({
        name: rel.name,
        value: call('one', [
          refkey(rel.otherModel),
          ts.ObjectExpression().children(
            List({
              comma: true,
              hardline: true,
              enderPunctuation: true,
              children: [
                ts.ObjectProperty({
                  name: 'fields',
                  value: arrayExpression(rel.fields.map((f) => member(refkey(rel.model), f))),
                }),
                ts.ObjectProperty({
                  name: 'references',
                  value: arrayExpression(rel.otherFields.map((f) => member(refkey(rel.otherModel), f))),
                }),
                ...Object.entries(relationName(rel)).map(([k, v]) => ts.ObjectProperty({ name: k, jsValue: v })),
              ],
            }),
          ),
        ]),
      }),
    );
  }
  for (const rel of reverseRelations) {
    const helper = isUniqueFieldSet(rel.model, rel.fields) ? 'one' : 'many';
    helpers.add(helper);
    const opts = relationName(rel);
    properties.push(
      ts.ObjectProperty({
        name: rel.otherName,
        value: call(helper, [refkey(rel.model), ...(isEmpty(opts) ? [] : [ts.ValueExpression({ jsValue: opts })])]),
      }),
    );
  }

  return ts.VarDeclaration({
    export: true,
    name: name + 'Relations',
    initializer: call(ormRef('relations'), [
      refkey(schema),
      [
        `({ ${[...helpers].join(', ')} }) => (`,
        ts
          .ObjectExpression()
          .children(List({ comma: true, hardline: true, enderPunctuation: true, children: properties })),
        ')',
      ],
    ]),
  });
};

const generateDbSchemaDeclarations = (schemas: Record<string, RootDefinitionSchemas>, declared: Set<string>) =>
  Object.values(schemas).flatMap((schema) => {
    const name = schema instanceof Model || schema instanceof Enum ? schema.dbSchema : undefined;
    if (!name || declared.has(name) || (dialect !== 'postgresql' && schema instanceof Enum)) return [];
    if (dialect === 'sqlite') throw new Error('Database schemas are not supported by SQLite');
    declared.add(name);

    return [
      ts.VarDeclaration({
        export: true,
        name: name + 'Schema',
        refkey: getDbSchemaRef(name),
        initializer: call(drizzleRef(byDialect({ postgresql: 'pgSchema', mysql: 'mysqlSchema', sqlite: '' })), [
          ts.ValueExpression({ jsValue: name }),
        ]),
      }),
    ];
  });

const generateDrizzleSchema = (
  schemas: Record<string, RootDefinitionSchemas>,
  relationMaps: RelationMaps,
  declaredDbSchemas: Set<string>,
) => [
  ...generateDbSchemaDeclarations(schemas, declaredDbSchemas),
  ...Object.entries(schemas).flatMap(([name, schema]) => {
    if (schema instanceof Model) {
      return [
        ...(dialect === 'postgresql' ? collectInlineEnums(name, schema) : []).map(([enumName, s]) =>
          generateEnumDeclaration(enumName, s),
        ),
        generateTableDeclaration(name, schema, relationMaps),
        generateRelationsDeclaration(name, schema, relationMaps),
      ].filter(isDefined);
    }

    return dialect === 'postgresql' && schema instanceof Enum ? [generateEnumDeclaration(name, schema)] : [];
  }),
];

export const generateDrizzleSchemasOutput = (
  opts: { dialect: DrizzleDialect },
  files: Record<string, Record<string, RootSchemas>>,
): OutputDirectory => {
  dialect = opts.dialect;
  enumRefs.clear();
  dbSchemaRefs.clear();

  const relations = Object.values(files).flatMap((schemas) =>
    Object.values(schemas).filter((s): s is ModelRelation => s instanceof ModelRelation),
  );
  const relationMaps = {
    direct: groupBy(relations, (r) => r.model.name),
    reverse: groupBy(relations, (r) => r.otherModel.name),
  };
  const definitionFiles = Object.entries(files).map(
    ([path, schemas]) =>
      [path, pickBy(schemas, (s): s is RootDefinitionSchemas => !(s instanceof ModelRelation))] as const,
  );
  for (const [, schemas] of definitionFiles) {
    for (const schema of Object.values(schemas)) {
      if (schema instanceof Enum) enumRefs.set(schema, refkey());
    }
  }

  const declaredDbSchemas = new Set<string>();
  return render(
    Output({ externals: Object.values(drizzlePackages) }).children(
      definitionFiles.map(([path, schemas]) =>
        ts
          .SourceFile({ path })
          .children(
            stc(() => StatementList({ children: generateDrizzleSchema(schemas, relationMaps, declaredDbSchemas) }))(),
          ),
      ),
    ),
  );
};

const flattenOutput = (dir: OutputDirectory): Record<string, string> =>
  Object.assign(
    {},
    ...dir.contents.map((c) =>
      c.kind === 'directory' ? flattenOutput(c) : 'contents' in c ? { [c.path]: c.contents } : {},
    ),
  );

export const generateDrizzleSchemas = (
  opts: { dialect: DrizzleDialect },
  files: Record<string, Record<string, RootSchemas>>,
) => flattenOutput(generateDrizzleSchemasOutput(opts, files));

export const writeDrizzleSchemas = (
  baseDir: string,
  opts: { dialect: DrizzleDialect },
  files: Record<string, Record<string, RootSchemas>>,
) => writeFiles(mapKeys(generateDrizzleSchemas(opts, files), (k) => baseDir + '/' + k));
