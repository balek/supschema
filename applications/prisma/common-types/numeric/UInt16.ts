import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { dbConnector, extendWithDbAttribute, PrismaExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/UInt16.js' {
  interface UInt16 extends PrismaExtension {}
}

const getDbType = () => {
  switch (dbConnector) {
    case 'postgresql':
      return;
    case 'mysql':
      return 'UnsignedSmallInt';
    case 'mongodb':
      return;
    case 'sqlserver':
      return;
    case 'sqlite':
      return;
    case 'cockroachdb':
      return 'Int4';
  }
};

extend(S.UInt16, {
  $prisma() {
    return extendWithDbAttribute(getDbType, {
      ...callSuper(this, '$prisma', S.UInt16),
      fieldType: 'Int',
    });
  },
});
