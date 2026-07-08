import { defineConstructor, createType, SchemaOptions } from '@supschema/core';
import { DataValue } from './DataValue';

export interface Intersect<T extends DataValue[]> extends DataValue {
  allOf: T;
}

export const Intersect = createType(
  import.meta,
  DataValue,
  defineConstructor(
    <T extends DataValue[]>(
      allOf: [...T],
      opts?: Omit<SchemaOptions<Intersect<T>>, 'allOf'>,
    ): SchemaOptions<Intersect<T>> => ({
      allOf,
      ...opts,
    }),
  ),
  ({ allOf, ...opts }) => [allOf, opts] as const,
);
export default Intersect;
