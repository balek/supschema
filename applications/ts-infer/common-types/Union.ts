import DataValue from '@supschema/common-types/DataValue.js';
import { Infer, InferExtension } from '../base.js';

declare module '@supschema/common-types/Union.js' {
  interface Union<T> extends InferExtension<
    {
      [K in keyof T]: T[K] extends DataValue ? Infer<T[K]> : never;
    }[number]
  > {}
}
