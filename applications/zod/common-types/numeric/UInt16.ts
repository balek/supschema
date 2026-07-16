import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ZodExtension } from '../../base.js';
import { z } from 'zod';
import { applyNumericConstraints } from './common.js';

declare module '@supschema/common-types/numeric/integer/UInt16.js' {
  interface UInt16 extends ZodExtension<z.ZodUInt32> {}
}

extend(S.UInt16, {
  get $zod() {
    return applyNumericConstraints(this, z.uint32().max((2 ^ 16) - 1));
  },
});
