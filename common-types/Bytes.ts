import { createType } from '@supschema/core';
import { DataValue } from './DataValue.js';

export interface Bytes extends DataValue {}

export const Bytes = createType<Bytes>(import.meta, DataValue);
export default Bytes;
