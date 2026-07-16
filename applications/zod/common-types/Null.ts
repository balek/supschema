import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { z } from 'zod';
import { applyDataValueMeta, ZodExtension } from '../base.js';

declare module '@supschema/common-types/Null.js' {
  interface Null extends ZodExtension<z.ZodNull> {}
}

extend(S.Null, {
  get $zod() {
    return applyDataValueMeta(this, z.null());
  },
});
