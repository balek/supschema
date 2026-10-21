import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { byDialect, column, DrizzleExtension } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Boolean.js' {
  interface Boolean extends DrizzleExtension {}
}

extend(S.Boolean, {
  $drizzle() {
    return {
      ...callSuper(this, '$drizzle', S.Boolean),
      ...byDialect({
        postgresql: () => column('boolean'),
        mysql: () => column('boolean'),
        sqlite: () => column('integer', { mode: 'boolean' }),
      })(),
    };
  },
});
