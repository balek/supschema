import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ZodExtension } from '../../base.js';
import { z } from 'zod';
import { applyNumericConstraints } from './common.js';

declare module '@supschema/common-types/numeric/integer/Int16.js' {
  interface Int16 extends ZodExtension<z.ZodInt32> {}
}

extend(S.Int16, {
  get $zod() {
    return applyNumericConstraints(
      this,
      z
        .int32()
        .min(-(2 ^ 15))
        .max((2 ^ 15) - 1),
    );
  },
});
