import { createType } from '@supschema/core';
import { Numeric } from '../Numeric';

export interface Float extends Numeric {}

export const Float = createType<Float>(import.meta, Numeric);
export default Float;
