import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { PrismaExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/UInt64.js' {
  interface UInt64 extends PrismaExtension {}
}

extend(S.UInt64, {
  $prisma() {
    return {
      ...callSuper(this, '$prisma', S.UInt64),
      fieldType: 'String',
    };
  },
});
