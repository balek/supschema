import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { dbConnector, extendWithDbAttribute, PrismaExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/Int8.js' {
  interface Int8 extends PrismaExtension {}
}

const getDbType = () => {
  switch (dbConnector) {
    case 'postgresql':
      return 'SmallInt';
    case 'mysql':
      return 'TinyInt';
    case 'mongodb':
      return;
    case 'sqlserver':
      return 'TinyInt';
    case 'sqlite':
      return;
    case 'cockroachdb':
      return 'Int2';
  }
};

extend(S.Int8, {
  $prisma() {
    return extendWithDbAttribute(getDbType, {
      ...callSuper(this, '$prisma', S.Int8),
      fieldType: 'Int',
    });
  },
});
