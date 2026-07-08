import { createType } from '@supschema/core';
import SafeInt from './SafeInt';

export interface UInt8 extends SafeInt {}

export const UInt8 = createType<UInt8>(import.meta, SafeInt);
export default UInt8;
