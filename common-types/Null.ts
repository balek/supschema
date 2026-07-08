import { createType } from '@supschema/core';
import { DataValue } from './DataValue';

export interface Null extends DataValue {}

export const Null = createType<Null>(import.meta, DataValue);
export default Null;
