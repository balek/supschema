import { InferExtension } from '../base.js';

declare module '@supschema/common-types/numeric/integer/UInt64.js' {
  interface UInt64 extends InferExtension<bigint> {}
}
