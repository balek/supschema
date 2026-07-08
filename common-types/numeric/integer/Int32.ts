import { createType } from '@supschema/core';
import SafeInt from './SafeInt';

export interface Int32 extends SafeInt {}

export const Int32 = createType<Int32>(import.meta, SafeInt);
export default Int32;
