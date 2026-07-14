import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { PrismaExtension } from '../../application.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/SafeInt.js' {
  interface SafeInt extends PrismaExtension {}
}

extend(S.SafeInt, {
  $prisma() {
    return {
      ...callSuper(this, '$prisma', S.SafeInt),
      fieldType: 'BigInt',
    };
  },
});
