import { InferExtension } from '../extension';

declare module '@supschema/common-types/Null.js' {
  interface Null extends InferExtension<null> {}
}
