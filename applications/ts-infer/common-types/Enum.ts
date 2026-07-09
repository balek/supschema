import { InferExtension } from '../extension';

declare module '@supschema/common-types/Enum.js' {
  interface Enum<V> extends InferExtension<V> {}
}
