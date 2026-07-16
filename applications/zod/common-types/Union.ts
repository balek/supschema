import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { applyDataValueMeta, ZodExtended, ZodExtension } from '../base.js';
import { z } from 'zod';

declare module '@supschema/common-types/Union.js' {
  interface Union<T> extends ZodExtension<
    T extends ZodExtended[]
      ? z.ZodUnion<{
          [K in keyof T]: T[K] extends ZodExtended<infer Z> ? Z : never;
        }>
      : never
  > {}
}

type ExtendedUnion = S.Union<(S.DataValue & ZodExtended)[]>;
extend(S.Union, {
  get $zod(): ExtendedUnion['$zod'] | undefined {
    if (this.anyOf.some((item) => !item.$zod)) return;
    return applyDataValueMeta(this, z.union(this.anyOf.map((item) => item.$zod)));
  },
} as ThisType<ExtendedUnion>);
