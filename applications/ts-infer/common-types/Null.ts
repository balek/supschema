import { InferExtension } from '../extension.js';

declare module '@supschema/common-types/Null.js' {
  interface Null extends InferExtension<null> {}
}
