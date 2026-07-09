import { createType } from '@supschema/core';
import { DataValue } from '../DataValue.js';

export interface Numeric extends DataValue {
  /**
   * Specifies an exclusive upper limit for the number (number must be less than this value).
   */
  exclusiveMaximum?: number;
  /**
   * Specifies an exclusive lower limit for the number (number must be greater than this value).
   */
  exclusiveMinimum?: number;
  /**
   * Specifies an inclusive upper limit for the number (number must be less than or equal to this value).
   */
  maximum?: number;
  /**
   * Specifies an inclusive lower limit for the number (number must be greater than or equal to this value).
   */
  minimum?: number;
  /**
   * Specifies that the number must be a multiple of this value.
   */
  multipleOf?: number;
}
export const Numeric = createType<Numeric>(import.meta, DataValue);
export default Numeric;
