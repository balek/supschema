import { InferExtension } from '../extension';

declare module '@supschema/common-types/String.js' {
  interface String extends InferExtension<string> {}
}
