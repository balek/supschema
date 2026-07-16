import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ZodExtension } from '../../base.js';
import { z } from 'zod';
import { applyNumericConstraints } from './common.js';

declare module '@supschema/common-types/numeric/integer/UInt32.js' {
  interface UInt32 extends ZodExtension<z.ZodUInt32> {}
}

extend(S.UInt32, {
  get $zod() {
    return applyNumericConstraints(this, z.uint32());
  },
});
