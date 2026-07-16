import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { z } from 'zod';
import { applyDataValueMeta, ZodExtension } from '../base.js';

declare module '@supschema/common-types/Bytes.js' {
  interface Bytes extends ZodExtension<z.ZodCustom<Uint8Array, Uint8Array>> {}
}

extend(S.Bytes, {
  get $zod() {
    return applyDataValueMeta(this, z.instanceof(Uint8Array));
  },
});
