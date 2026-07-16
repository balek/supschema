import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { applyDataValueMeta, ZodExtended, ZodExtension } from '../base.js';
import { z } from 'zod';

declare module '@supschema/common-types/Array.js' {
  interface Array<S> extends ZodExtension<S extends ZodExtended<infer Z> ? z.ZodArray<Z> : undefined> {}
}

type ExtendedArray = S.Array<S.DataValue & ZodExtended>;
extend(S.Array, {
  get $zod(): ExtendedArray['$zod'] | undefined {
    if (!this.items.$zod) return;

    let arraySchema = z.array(this.items.$zod);

    if (this.minItems !== undefined) arraySchema = arraySchema.min(this.minItems);
    if (this.maxItems !== undefined) arraySchema = arraySchema.max(this.maxItems);

    arraySchema = arraySchema.superRefine((value, ctx) => {
      if (this.uniqueItems) {
        const seen = new Set<string>();
        for (const item of value) {
          const key = JSON.stringify(item);
          if (seen.has(key)) {
            ctx.addIssue({
              code: 'custom',
              message: 'Array items must be unique',
            });
            break;
          }
          seen.add(key);
        }
      }

      if (this.prefixItems) {
        for (const [index, prefixItem] of this.prefixItems.entries()) {
          if (index >= value.length) break;
          const parsed = (prefixItem as S.DataValue & ZodExtension).$zod?.safeParse(value[index]);
          if (parsed && !parsed.success) {
            ctx.addIssue({
              code: 'custom',
              path: [index],
              message: `Item at index ${index} does not match prefix schema`,
            });
          }
        }
      }

      const containsSchema = (this.contains as (S.DataValue & ZodExtension) | undefined)?.$zod;
      if (containsSchema) {
        let matchCount = 0;

        for (const item of value) {
          if (containsSchema?.safeParse(item).success) matchCount++;
        }

        const minContains = this.minContains ?? 1;
        const maxContains = this.maxContains;

        if (matchCount < minContains) {
          ctx.addIssue({
            code: 'custom',
            message: `Array must contain at least ${minContains} matching item(s)`,
          });
        }

        if (maxContains !== undefined && matchCount > maxContains) {
          ctx.addIssue({
            code: 'custom',
            message: `Array must contain at most ${maxContains} matching item(s)`,
          });
        }
      }
    });

    return applyDataValueMeta(this, arraySchema);
  },
} as ThisType<ExtendedArray>);
