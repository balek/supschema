import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { applyDataValueMeta, ZodExtended, ZodExtension } from '../base.js';
import { z } from 'zod';

declare module '@supschema/common-types/Tuple.js' {
  interface Tuple<T> extends ZodExtension<
    T extends ZodExtended[]
      ? z.ZodTuple<{
          [K in keyof T]: T[K] extends ZodExtended<infer Z> ? Z : never;
        }>
      : never
  > {}
}

type ExtendedTuple = S.Tuple<(S.DataValue & ZodExtended)[]>;
extend(S.Tuple, {
  get $zod(): ExtendedTuple['$zod'] | undefined {
    if (this.items.some((item) => !item.$zod)) return;
    return applyDataValueMeta(this, z.tuple(this.items.map((s) => s.$zod) as never));
  },
} as ThisType<ExtendedTuple>);
