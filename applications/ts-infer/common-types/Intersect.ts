import DataValue from '@supschema/common-types/DataValue.js';
import { Infer, InferExtension } from '../extension';

type InferIntersect<T extends DataValue[], Acc extends unknown = unknown> = T extends [
  infer L extends DataValue,
  ...infer R extends DataValue[],
]
  ? InferIntersect<R, Acc & Infer<L>>
  : Acc;

declare module '@supschema/common-types/Intersect.js' {
  interface Intersect<T> extends InferExtension<InferIntersect<T>> {}
}
