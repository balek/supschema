import { InferExtension } from '../base.js';

declare module '@supschema/common-types/Null.js' {
  interface Null extends InferExtension<null> {}
}
