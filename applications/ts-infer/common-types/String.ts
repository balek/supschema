import { InferExtension } from '../extension.js';

declare module '@supschema/common-types/String.js' {
  interface String extends InferExtension<string> {}
}
