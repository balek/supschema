import { InferExtension } from '../extension';

declare module '@supschema/common-types/numeric/integer/Int64.js' {
  interface Int64 extends InferExtension<bigint> {}
}
