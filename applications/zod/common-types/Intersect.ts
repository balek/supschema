import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { applyDataValueMeta, ZodExtended, ZodExtension } from '../base.js';
import { z } from 'zod';

type ZodInferIntersect<T extends S.DataValue[]> = T extends [ZodExtended<infer L>, ...infer R extends S.DataValue[]]
  ? R extends never[]
    ? L
    : z.ZodIntersection<L, ZodInferIntersect<R>>
  : never;

declare module '@supschema/common-types/Intersect.js' {
  interface Intersect<T> extends ZodExtension<ZodInferIntersect<T>> {}
}

type ExtendedIntersect = S.Intersect<[S.DataValue & ZodExtended]>;
extend(S.Intersect, {
  get $zod(): ExtendedIntersect['$zod'] | undefined {
    if (this.allOf.some((item) => !item.$zod)) return;
    const variants = this.allOf.map((item) => item.$zod);
    const [first, ...rest] = variants;
    const zodSchema = rest.reduce((acc, current) => z.intersection(acc, current), first);
    return applyDataValueMeta(this, zodSchema);
  },
} as ThisType<ExtendedIntersect>);
