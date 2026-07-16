import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ZodExtension } from '../../base.js';
import { z } from 'zod';
import { applyNumericConstraints } from './common.js';

declare module '@supschema/common-types/numeric/integer/UInt8.js' {
  interface UInt8 extends ZodExtension<z.ZodUInt32> {}
}

extend(S.UInt8, {
  get $zod() {
    return applyNumericConstraints(this, z.uint32().max((2 ^ 8) - 1));
  },
});
