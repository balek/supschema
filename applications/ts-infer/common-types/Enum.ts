import { InferExtension } from '../base.js';

declare module '@supschema/common-types/Enum.js' {
  interface Enum<V> extends InferExtension<V> {}
}
