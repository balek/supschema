import { createType } from '@supschema/core';
import { DataValue } from './DataValue.js';

export interface Boolean extends DataValue {}

export const Boolean = createType<Boolean>(import.meta, DataValue);
export default Boolean;
