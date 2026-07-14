import { Infer, InferExtension } from '../base.js';

declare module '@supschema/common-types/Nullable.js' {
  interface Nullable<S> extends InferExtension<Infer<S> | null> {}
}
