import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { byDialect, column, DrizzleExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/UInt8.js' {
  interface UInt8 extends DrizzleExtension {}
}

extend(S.UInt8, {
  $drizzle() {
    return {
      ...callSuper(this, '$drizzle', S.UInt8),
      ...byDialect({
        postgresql: () => column('smallint'),
        mysql: () => column('tinyint', { unsigned: true }),
        sqlite: () => column('integer'),
      })(),
    };
  },
});
