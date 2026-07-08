import DataValue from '@supschema/common-types/DataValue.js';
import { Infer, InferExtension } from '../extension';

type InferTuple<T extends DataValue[], Acc extends unknown[] = []> = T extends [
  infer L extends DataValue,
  ...infer R extends DataValue[],
]
  ? InferTuple<R, [...Acc, Infer<L>]>
  : Acc;

declare module '@supschema/common-types/Tuple.js' {
  interface Tuple<T> extends InferExtension<InferTuple<T>> {}
}
