import { Infer, InferExtension } from '../base.js';

declare module '@supschema/common-types/object/Optional.js' {
  interface Optional<S> extends InferExtension<Infer<S> | undefined> {}
}
