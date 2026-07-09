import { createType } from '@supschema/core';
import { Float } from './Float.js';

export interface Float32 extends Float {}

export const Float32 = createType<Float32>(import.meta, Float);
export default Float32;
