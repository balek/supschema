import { createType } from '@supschema/core';
import { Numeric } from '../Numeric.js';

export interface Float extends Numeric {}

export const Float = createType<Float>(import.meta, Numeric);
export default Float;
