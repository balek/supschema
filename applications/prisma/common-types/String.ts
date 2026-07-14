import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { PrismaExtension } from '../application.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/String.js' {
  interface String extends PrismaExtension {}
}

extend(S.String, {
  $prisma() {
    return {
      ...callSuper(this, '$prisma', S.String),
      fieldType: 'String',
    };
  },
});
