import { Infer, InferExtension } from '../extension.js';

declare module '@supschema/common-types/object/Optional.js' {
  interface Optional<S> extends InferExtension<Infer<S> | undefined> {}
}
