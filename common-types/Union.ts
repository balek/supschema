import { defineConstructor, createType, SchemaOptions } from '@supschema/core';
import { DataValue } from './DataValue';

export interface Union<T extends DataValue[]> extends DataValue {
  anyOf: T;
}

export const Union = createType(
  import.meta,
  DataValue,
  defineConstructor(
    <T extends DataValue[]>(anyOf: [...T], opts?: Omit<SchemaOptions<Union<T>>, 'anyOf'>): SchemaOptions<Union<T>> => ({
      anyOf,
      ...opts,
    }),
  ),
  ({ anyOf, ...opts }) => [anyOf, opts] as const,
);
export default Union;
