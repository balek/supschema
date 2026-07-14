import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { PrismaExtension } from '../application.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Bytes.js' {
  interface Bytes extends PrismaExtension {}
}

extend(S.Bytes, {
  $prisma() {
    return {
      ...callSuper(this, '$prisma', S.Bytes),
      fieldType: 'Bytes',
    };
  },
});
