import { createType } from '@supschema/core';
import SafeInt from './SafeInt';

export interface UInt16 extends SafeInt {}

export const UInt16 = createType<UInt16>(import.meta, SafeInt);
export default UInt16;
