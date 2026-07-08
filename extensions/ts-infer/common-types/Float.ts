import { InferExtension } from '../extension';

declare module '@supschema/common-types/numeric/float/Float.js' {
  interface Float extends InferExtension<number> {}
}
