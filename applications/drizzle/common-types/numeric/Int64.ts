import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { byDialect, column, DrizzleExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/Int64.js' {
  interface Int64 extends DrizzleExtension {}
}

extend(S.Int64, {
  $drizzle() {
    return {
      ...callSuper(this, '$drizzle', S.Int64),
      ...byDialect({
        postgresql: () => column('bigint', { mode: 'bigint' }),
        mysql: () => column('bigint', { mode: 'bigint' }),
        sqlite: () => column('blob', { mode: 'bigint' }),
      })(),
    };
  },
});
