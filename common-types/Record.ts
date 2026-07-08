import { defineConstructor, createType, SchemaOptions } from '@supschema/core';
import { String } from './String';
import { DataValue } from './DataValue';

export interface Record<K extends String, V extends DataValue> extends DataValue {
  keys: K;
  values: V;
}

export const Record = createType(
  import.meta,
  DataValue,
  defineConstructor(
    <K extends String, V extends DataValue>(
      keys: K,
      values: V,
      opts?: Omit<SchemaOptions<Record<K, V>>, 'keys' | 'values'>,
    ): SchemaOptions<Record<K, V>> => ({
      keys,
      values,
      ...opts,
    }),
  ),
  ({ keys, values, ...opts }) => [keys, values, opts] as const,
);
export default Record;
