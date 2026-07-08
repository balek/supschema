import { InferExtension } from '../extension';

declare module '@supschema/common-types/Boolean.js' {
  interface Boolean extends InferExtension<boolean> {}
}
