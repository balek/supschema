import { InferExtension } from '../extension.js';

declare module '@supschema/common-types/Enum.js' {
  interface Enum<V> extends InferExtension<V> {}
}
