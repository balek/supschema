import { defineConstructor, createType, SchemaOptions } from '@supschema/core';
import { DataValue } from './DataValue';

export interface Nullable<S extends DataValue> extends DataValue {
  schema: S;
}

export const Nullable = createType(
  import.meta,
  DataValue,
  defineConstructor(
    <S extends DataValue>(
      schema: S,
      opts?: Omit<SchemaOptions<Nullable<S>>, 'schema'>,
    ): SchemaOptions<Nullable<S>> => ({
      schema,
      ...opts,
    }),
  ),
  ({ schema, ...opts }) => [schema, opts] as const,
);
export default Nullable;
