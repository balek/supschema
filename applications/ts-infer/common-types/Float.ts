import { InferExtension } from '../extension.js';

declare module '@supschema/common-types/numeric/float/Float.js' {
  interface Float extends InferExtension<number> {}
}
