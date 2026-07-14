import { Infer, InferExtension } from '../base.js';

declare module '@supschema/common-types/Array.js' {
  interface Array<S> extends InferExtension<Infer<S>[]> {}
}
