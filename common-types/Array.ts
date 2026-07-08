import { defineConstructor, createType, SchemaOptions } from '@supschema/core';
import { DataValue } from './DataValue';

export interface Array<S extends DataValue> extends DataValue {
  items: S;

  /**
   * The minimum number of items allowed in the array.
   */
  minItems?: number;
  /**
   * The maximum number of items allowed in the array.
   */
  maxItems?: number;
  /**
   * A schema that at least one item in the array must validate against.
   */
  contains?: DataValue;
  /**
   * The minimum number of array items that must validate against the `contains` schema.
   */
  minContains?: number;
  /**
   * The maximum number of array items that may validate against the `contains` schema.
   */
  maxContains?: number;
  /**
   * An array of schemas, where each schema in `prefixItems` validates against items at corresponding positions from the beginning of the array.
   */
  prefixItems?: DataValue[];
  /**
   * If `true`, all items in the array must be unique.
   */
  uniqueItems?: boolean;
}

export const Array = createType(
  import.meta,
  DataValue,
  defineConstructor(
    <S extends DataValue>(items: S, opts?: Omit<SchemaOptions<Array<S>>, 'items'>): SchemaOptions<Array<S>> => ({
      items,
      ...opts,
    }),
  ),
  ({ items, ...opts }) => [items, opts] as const,
);
export default Array;
