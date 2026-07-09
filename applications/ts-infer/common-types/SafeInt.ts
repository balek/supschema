import { InferExtension } from '../extension.js';

declare module '@supschema/common-types/numeric/integer/SafeInt.js' {
  interface SafeInt extends InferExtension<number> {}
}
