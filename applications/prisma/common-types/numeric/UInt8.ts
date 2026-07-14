import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { dbConnector, extendWithDbAttribute, PrismaExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/UInt8.js' {
  interface UInt8 extends PrismaExtension {}
}

const getDbType = () => {
  switch (dbConnector) {
    case 'postgresql':
      return 'SmallInt';
    case 'mysql':
      return 'UnsignedTinyInt';
    case 'mongodb':
      return;
    case 'sqlserver':
      return 'SmallInt';
    case 'sqlite':
      return;
    case 'cockroachdb':
      return 'Int2';
  }
};

extend(S.UInt8, {
  $prisma() {
    return extendWithDbAttribute(getDbType, {
      ...callSuper(this, '$prisma', S.UInt8),
      fieldType: 'Int',
    });
  },
});
