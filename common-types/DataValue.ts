import { createType, Schema } from '@supschema/core';

export interface DataValue extends Schema {
  title?: string;
  description?: string;
  deprecated?: boolean;
}

export const DataValue = createType<DataValue>(import.meta, Schema);
export default DataValue;
