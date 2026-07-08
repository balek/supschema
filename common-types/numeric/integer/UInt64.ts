import { createType } from '@supschema/core';
import { Integer } from './Integer';

export interface UInt64 extends Integer {}

export const UInt64 = createType<UInt64>(import.meta, Integer);
export default UInt64;
