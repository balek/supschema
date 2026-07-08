import { createType } from '@supschema/core';
import { Numeric } from '../Numeric';

export interface Integer extends Numeric {}

export const Integer = createType<Integer>(import.meta, Numeric);
export default Integer;
