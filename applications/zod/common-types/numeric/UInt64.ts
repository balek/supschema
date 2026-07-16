import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ZodExtension } from '../../base.js';
import { z } from 'zod';
import { applyBigIntConstraints } from './common.js';

declare module '@supschema/common-types/numeric/integer/UInt64.js' {
  interface UInt64 extends ZodExtension<z.ZodBigInt> {}
}

extend(S.UInt64, {
  get $zod() {
    return applyBigIntConstraints(this, z.uint64());
  },
});
