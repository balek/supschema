import { createType } from '@supschema/core';
import SafeInt from './SafeInt';

export interface UInt32 extends SafeInt {}

export const UInt32 = createType<UInt32>(import.meta, SafeInt);
export default UInt32;
