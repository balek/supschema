import { createType } from '@supschema/core';
import SafeInt from './SafeInt.js';

export interface Int8 extends SafeInt {}

export const Int8 = createType<Int8>(import.meta, SafeInt);
export default Int8;
