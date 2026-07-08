import { getSchemaType, nodeModulesSchemaPathGetter, Schema, SchemaPathGetter, SchemaType } from '@supschema/core';

type JsonValue = string | number | boolean | null | undefined | JsonValue[] | { [key: string]: JsonValue };

const SERIALIZED_SCHEMA_SYMBOL = '___SCHEMA___';
export type SerializedSchema = [typeof SERIALIZED_SCHEMA_SYMBOL, path: string, ...JsonValue[]];

export const serializeSchemaValue = (v: unknown, schemaPathGetter?: SchemaPathGetter): JsonValue => {
  if (v === null || v === undefined) return v;

  if (typeof v === 'object') {
    if (v instanceof Schema) return serializeSchema(v, schemaPathGetter);
    if (Array.isArray(v)) return v.map((i) => serializeSchemaValue(i, schemaPathGetter));
    return Object.fromEntries(Object.entries(v).map(([k, v]) => [k, serializeSchemaValue(v, schemaPathGetter)]));
  }

  return v as never;
};

export const serializeSchema = (
  schema: Schema,
  schemaPathGetter: SchemaPathGetter = nodeModulesSchemaPathGetter,
): SerializedSchema => {
  const type = getSchemaType(schema);

  return [
    SERIALIZED_SCHEMA_SYMBOL,
    schemaPathGetter(type.importMeta),
    ...type.getConstructorArgs(schema).map((v) => serializeSchemaValue(v, schemaPathGetter)),
  ];
};

type ImportPathTransformer = (schemaPath: string) => string;

export const deserializeValue = async (v: unknown, importPathTransformer?: ImportPathTransformer): Promise<any> => {
  if (v === null || v === undefined) return v;

  if (typeof v === 'object') {
    if (Array.isArray(v))
      if (v[0] === SERIALIZED_SCHEMA_SYMBOL && typeof v[1] === 'string')
        return await deserializeSchemaValue(v as SerializedSchema, importPathTransformer);
      else return await Promise.all(v.map((i) => deserializeValue(i, importPathTransformer)));
    return Object.fromEntries(
      await Promise.all(Object.entries(v).map(async ([k, v]) => [k, await deserializeValue(v, importPathTransformer)])),
    );
  }

  return v;
};

export const deserializeSchemaValue = async (
  [_symbol, path, ...args]: SerializedSchema,
  importPathTransformer: ImportPathTransformer = (s) => s,
): Promise<Schema> => {
  const type = (await import(importPathTransformer(path))).default as SchemaType;
  const deserializedArgs = await Promise.all(args.map((v) => deserializeValue(v, importPathTransformer)));
  return type(...deserializedArgs);
};
