import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { applyDataValueMeta, ZodExtended, ZodExtension } from '../base.js';
import { z } from 'zod';
import { mapValues } from 'remeda';

declare module '@supschema/common-types/object/Object.js' {
  interface Object<P> extends ZodExtension<
    AllPropertiesExtend<P, ZodExtended> extends true
      ? z.ZodObject<{ [K in keyof P]: P[K] extends ZodExtended<infer Z> ? Z : never }>
      : never
  > {}
}

type ExtendedObject = S.Object<Record<string, S.DataValue & ZodExtended>>;
extend(S.Object, {
  get $zod(): ExtendedObject['$zod'] | undefined {
    if (Object.values(this.properties).some((prop) => !prop.$zod)) return;
    return applyDataValueMeta(this, z.strictObject(mapValues(this.properties, (s) => s.$zod)));
  },
} as ThisType<ExtendedObject>);
