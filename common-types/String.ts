import { createType } from '@supschema/core';
import { DataValue } from './DataValue.js';

export interface String extends DataValue {
  /**
   * Specifies the minimum number of characters allowed in the string.
   * Must be a non-negative integer.
   */
  minLength?: number;
  /**
   * Specifies the maximum number of characters allowed in the string.
   * Must be a non-negative integer.
   */
  maxLength?: number;
  /**
   * Specifies a regular expression pattern that the string value must match.
   */
  pattern?: string;
}
export const String = createType<String>(import.meta, DataValue);
export default String;
