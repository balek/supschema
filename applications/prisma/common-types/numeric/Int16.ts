import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { dbConnector, extendWithDbAttribute, PrismaExtension } from '../../application.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/Int16.js' {
  interface Int16 extends PrismaExtension {}
}

const getDbType = () => {
  switch (dbConnector) {
    case 'postgresql':
      return 'SmallInt';
    case 'mysql':
      return 'SmallInt';
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

extend(S.Int16, {
  $prisma() {
    return extendWithDbAttribute(getDbType, {
      ...callSuper(this, '$prisma', S.Int16),
      fieldType: 'Int',
    });
  },
});
