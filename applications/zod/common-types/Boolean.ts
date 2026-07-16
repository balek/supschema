import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { z } from 'zod';
import { applyDataValueMeta, ZodExtension } from '../base.js';

declare module '@supschema/common-types/Boolean.js' {
  interface Boolean extends ZodExtension<z.ZodBoolean> {}
}

extend(S.Boolean, {
  get $zod() {
    return applyDataValueMeta(this, z.boolean());
  },
});
