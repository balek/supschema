import { createType } from '@supschema/core';
import { Integer } from './Integer.js';

export interface SafeInt extends Integer {}

export const SafeInt = createType<SafeInt>(import.meta, Integer);
export default SafeInt;
