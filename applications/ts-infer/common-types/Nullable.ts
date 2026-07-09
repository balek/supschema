import { Infer, InferExtension } from '../extension.js';

declare module '@supschema/common-types/Nullable.js' {
  interface Nullable<S> extends InferExtension<Infer<S> | null> {}
}
