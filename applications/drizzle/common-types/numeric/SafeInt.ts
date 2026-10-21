import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { byDialect, column, DrizzleExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/SafeInt.js' {
  interface SafeInt extends DrizzleExtension {}
}

extend(S.SafeInt, {
  $drizzle() {
    return {
      ...callSuper(this, '$drizzle', S.SafeInt),
      ...byDialect({
        postgresql: () => column('bigint', { mode: 'number' }),
        mysql: () => column('bigint', { mode: 'number' }),
        sqlite: () => column('integer'),
      })(),
    };
  },
});
