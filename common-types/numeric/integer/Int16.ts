import { createType } from '@supschema/core';
import SafeInt from './SafeInt.js';

export interface Int16 extends SafeInt {}

export const Int16 = createType<Int16>(import.meta, SafeInt);
export default Int16;
