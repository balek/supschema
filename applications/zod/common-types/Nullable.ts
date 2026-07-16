import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { applyDataValueMeta, ZodExtended, ZodExtension } from '../base.js';
import z from 'zod';

declare module '@supschema/common-types/Nullable.js' {
  interface Nullable<S> extends ZodExtension<S extends ZodExtended<infer Z> ? z.ZodNullable<Z> : never> {}
}

type ExtendedNullable = S.Nullable<S.DataValue & ZodExtended>;
extend(S.Nullable, {
  get $zod(): ExtendedNullable['$zod'] | undefined {
    if (!this.schema.$zod) return;
    return applyDataValueMeta(this, this.schema.$zod.nullable());
  },
} as ThisType<ExtendedNullable>);
