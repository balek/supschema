import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { PrismaExtension } from '../../application.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/Int64.js' {
  interface Int64 extends PrismaExtension {}
}

extend(S.Int64, {
  $prisma() {
    return {
      ...callSuper(this, '$prisma', S.Int64),
      fieldType: 'BigInt',
    };
  },
});
