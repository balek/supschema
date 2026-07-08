import { createType } from '@supschema/core';
import { Float } from './Float';

export interface Float64 extends Float {}

export const Float64 = createType<Float64>(import.meta, Float);
export default Float64;
