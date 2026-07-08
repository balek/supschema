import { Infer, InferExtension } from '../extension';

declare module '@supschema/common-types/Record.js' {
  interface Record<K, V> extends InferExtension<globalThis.Record<Infer<K>, Infer<V>>> {}
}
