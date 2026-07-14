import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { dbConnector, extendWithDbAttribute, PrismaExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/Int32.js' {
  interface Int32 extends PrismaExtension {}
}

extend(S.Int32, {
  $prisma() {
    return extendWithDbAttribute(() => (dbConnector === 'cockroachdb' ? 'Int4' : undefined), {
      ...callSuper(this, '$prisma', S.Int32),
      fieldType: 'Int',
    });
  },
});
