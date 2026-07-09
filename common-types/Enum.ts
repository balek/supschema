import { defineConstructor, createType, SchemaOptions } from '@supschema/core';
import { DataValue } from './DataValue.js';

export interface EnumValueMeta {}

export interface Enum<V extends string> extends DataValue {
  values: Record<V, EnumValueMeta>;
}

export const Enum = createType(
  import.meta,
  DataValue,
  defineConstructor(
    <V extends string>(
      values: Record<V, EnumValueMeta>,
      opts?: Omit<SchemaOptions<Enum<V>>, 'values'>,
    ): SchemaOptions<Enum<V>> => ({
      values,
      ...opts,
    }),
  ),
  ({ values, ...opts }) => [values, opts] as const,
);
export default Enum;
