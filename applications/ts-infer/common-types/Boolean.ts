import { InferExtension } from '../extension.js';

declare module '@supschema/common-types/Boolean.js' {
  interface Boolean extends InferExtension<boolean> {}
}
