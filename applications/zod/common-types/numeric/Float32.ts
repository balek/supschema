import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ZodExtension } from '../../base.js';
import { z } from 'zod';
import { applyNumericConstraints } from './common.js';

declare module '@supschema/common-types/numeric/float/Float32.js' {
  interface Float32 extends ZodExtension<z.ZodFloat32> {}
}

extend(S.Float32, {
  get $zod() {
    return applyNumericConstraints(this, z.float32());
  },
});
