import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { byDialect, column, DrizzleExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/UInt16.js' {
  interface UInt16 extends DrizzleExtension {}
}

extend(S.UInt16, {
  $drizzle() {
    return {
      ...callSuper(this, '$drizzle', S.UInt16),
      ...byDialect({
        postgresql: () => column('integer'),
        mysql: () => column('smallint', { unsigned: true }),
        sqlite: () => column('integer'),
      })(),
    };
  },
});
