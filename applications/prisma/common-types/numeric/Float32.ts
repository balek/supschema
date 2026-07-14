import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { dbConnector, extendWithDbAttribute, PrismaExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/float/Float32.js' {
  interface Float32 extends PrismaExtension {}
}

const getDbType = () => {
  switch (dbConnector) {
    case 'postgresql':
      return 'Real';
    case 'mysql':
      return 'Float';
    case 'mongodb':
      return;
    case 'sqlserver':
      return 'Float';
    case 'sqlite':
      return;
    case 'cockroachdb':
      return 'Float4';
  }
};

extend(S.Float32, {
  $prisma() {
    return extendWithDbAttribute(getDbType, {
      ...callSuper(this, '$prisma', S.Float32),
      fieldType: 'Float',
    });
  },
});
