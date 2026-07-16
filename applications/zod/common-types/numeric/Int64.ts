import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ZodExtension } from '../../base.js';
import { z } from 'zod';
import { applyBigIntConstraints } from './common.js';

declare module '@supschema/common-types/numeric/integer/Int64.js' {
  interface Int64 extends ZodExtension<z.ZodBigInt> {}
}

extend(S.Int64, {
  get $zod() {
    return applyBigIntConstraints(this, z.int64());
  },
});
