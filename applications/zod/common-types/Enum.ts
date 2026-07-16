import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { applyDataValueMeta, ZodExtension } from '../base.js';
import { z } from 'zod';

declare module '@supschema/common-types/Enum.js' {
  interface Enum<V> extends ZodExtension<z.ZodEnum<{ [K in V]: K }>> {}
}

extend(S.Enum, {
  get $zod() {
    return applyDataValueMeta(this, z.enum(Object.keys(this.values)));
  },
});
