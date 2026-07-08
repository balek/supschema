import { Infer, InferExtension } from '../extension';

declare module '@supschema/common-types/Array.js' {
  interface Array<S> extends InferExtension<Infer<S>[]> {}
}
