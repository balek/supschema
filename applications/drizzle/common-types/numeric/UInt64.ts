import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { byDialect, column, DrizzleExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/UInt64.js' {
  interface UInt64 extends DrizzleExtension {}
}

extend(S.UInt64, {
  $drizzle() {
    return {
      ...callSuper(this, '$drizzle', S.UInt64),
      ...byDialect({
        postgresql: () => column('numeric', { precision: 20, scale: 0 }),
        mysql: () => column('bigint', { mode: 'bigint', unsigned: true }),
        sqlite: () => column('text'),
      })(),
    };
  },
});
