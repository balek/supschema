import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { dbConnector, extendWithDbAttribute, PrismaExtension } from '../../application.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/UInt32.js' {
  interface UInt32 extends PrismaExtension {}
}

extend(S.UInt32, {
  $prisma() {
    return extendWithDbAttribute(() => (dbConnector === 'mongodb' ? 'UnsignedInt' : undefined), {
      ...callSuper(this, '$prisma', S.UInt32),
      fieldType: dbConnector === 'mongodb' ? 'Int' : 'BigInt',
    });
  },
});
