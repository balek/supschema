import { Infer, InferExtension } from '../extension';
import { Evaluate } from '@supschema/core/utils.js';

declare module '@supschema/common-types/object/Object.js' {
  interface Object<P> extends InferExtension<
    Evaluate<
      {
        [K in OptionalPropertyKeys<P>]?: P[K] extends InferExtension<any> ? Infer<P[K]> : never;
      } & {
        [K in RequiredPropertyKeys<P>]: P[K] extends Infer<any> ? Infer<P[K]> : never;
      }
    >
  > {}
}
