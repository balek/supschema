import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { PrismaExtension } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Boolean.js' {
  interface Boolean extends PrismaExtension {}
}

extend(S.Boolean, {
  $prisma() {
    return {
      ...callSuper(this, '$prisma', S.Boolean),
      fieldType: 'Boolean',
    };
  },
});
