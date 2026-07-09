import { createType } from '@supschema/core';
import { Integer } from './Integer.js';

export interface Int64 extends Integer {}

export const Int64 = createType<Int64>(import.meta, Integer);
export default Int64;
