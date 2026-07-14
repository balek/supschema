import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { PrismaExtension } from '../../application.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/float/Float64.js' {
  interface Float64 extends PrismaExtension {}
}

extend(S.Float64, {
  $prisma() {
    return {
      ...callSuper(this, '$prisma', S.Float64),
      fieldType: 'Float',
    };
  },
});
