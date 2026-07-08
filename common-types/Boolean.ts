import { createType } from '@supschema/core';
import { DataValue } from './DataValue';

export interface Boolean extends DataValue {}

export const Boolean = createType<Boolean>(import.meta, DataValue);
export default Boolean;
