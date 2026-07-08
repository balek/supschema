import { defineConstructor, createType, SchemaOptions } from '@supschema/core';
import { DataValue } from './DataValue';

export interface Tuple<T extends DataValue[]> extends DataValue {
  items: T;
}

export const Tuple = createType(
  import.meta,
  DataValue,
  defineConstructor(
    <T extends DataValue[]>(items: [...T], opts?: Omit<SchemaOptions<Tuple<T>>, 'items'>): SchemaOptions<Tuple<T>> => ({
      items,
      ...opts,
    }),
  ),
  ({ items, ...opts }) => [items, opts] as const,
);
export default Tuple;
