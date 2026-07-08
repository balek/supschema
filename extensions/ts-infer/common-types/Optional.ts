import { Infer, InferExtension } from '../extension';

declare module '@supschema/common-types/object/Optional.js' {
  interface Optional<S> extends InferExtension<Infer<S> | undefined> {}
}
