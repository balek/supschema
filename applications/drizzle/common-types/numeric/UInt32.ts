import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { byDialect, column, DrizzleExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/UInt32.js' {
  interface UInt32 extends DrizzleExtension {}
}

extend(S.UInt32, {
  $drizzle() {
    return {
      ...callSuper(this, '$drizzle', S.UInt32),
      ...byDialect({
        postgresql: () => column('bigint', { mode: 'number' }),
        mysql: () => column('int', { unsigned: true }),
        sqlite: () => column('integer'),
      })(),
    };
  },
});
