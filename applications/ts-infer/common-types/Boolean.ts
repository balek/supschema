import { InferExtension } from '../base.js';

declare module '@supschema/common-types/Boolean.js' {
  interface Boolean extends InferExtension<boolean> {}
}
