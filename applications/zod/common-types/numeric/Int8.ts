import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ZodExtension } from '../../base.js';
import { z } from 'zod';
import { applyNumericConstraints } from './common.js';

declare module '@supschema/common-types/numeric/integer/Int8.js' {
  interface Int8 extends ZodExtension<z.ZodInt32> {}
}

extend(S.Int8, {
  get $zod() {
    return applyNumericConstraints(
      this,
      z
        .int32()
        .min(-(2 ^ 7))
        .max((2 ^ 7) - 1),
    );
  },
});
