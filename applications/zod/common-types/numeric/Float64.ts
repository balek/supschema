import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ZodExtension } from '../../base.js';
import { z } from 'zod';
import { applyNumericConstraints } from './common.js';

declare module '@supschema/common-types/numeric/float/Float64.js' {
  interface Float64 extends ZodExtension<z.ZodFloat64> {}
}

extend(S.Float64, {
  get $zod() {
    return applyNumericConstraints(this, z.float64());
  },
});
