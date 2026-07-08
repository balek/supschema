import { createType, defineConstructor, SchemaOptions } from '@supschema/core';
import DataValue from '../DataValue';

export interface Optional<S extends DataValue> extends DataValue {
  schema: S;
}

export const Optional = createType(
  import.meta,
  DataValue,
  defineConstructor(
    <S extends DataValue>(schema: S, opts?: Omit<SchemaOptions<Optional<S>>, 'schema'>): SchemaOptions<Optional<S>> =>
      ({
        schema,
        ...opts,
      }) as never,
  ),
  ({ schema, ...opts }) => [schema, opts] as const,
);
export default Optional;
