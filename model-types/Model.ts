import { defineConstructor, createType, SchemaOptions } from '@supschema/core';
import { Object, ObjectProperties } from '@supschema/common-types/object/Object.js';

export interface Model<Name extends string = any, P extends ObjectProperties = any> extends Object<P> {
  name: Name;
  dbSchema?: string;
  key: (keyof P)[];
  indexes?: { fields: (keyof P)[]; where?: string }[];
  uniques?: { fields: (keyof P)[]; where?: string }[];
  description?: string;
  view?: boolean;
}

export const Model = createType(
  import.meta,
  Object,
  defineConstructor(
    <Name extends string, P extends ObjectProperties>(
      opts: Omit<SchemaOptions<Model<Name, P>>, 'properties'>,
      properties: P,
    ): SchemaOptions<Model<Name, P>> => ({
      properties,
      ...opts,
    }),
  ),
  ({ properties, ...opts }) => [opts, properties] as const,
);
export default Model;
