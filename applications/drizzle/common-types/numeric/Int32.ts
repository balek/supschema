import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { byDialect, column, DrizzleExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/Int32.js' {
  interface Int32 extends DrizzleExtension {}
}

extend(S.Int32, {
  $drizzle() {
    return {
      ...callSuper(this, '$drizzle', S.Int32),
      ...byDialect({
        postgresql: () => column('integer'),
        mysql: () => column('int'),
        sqlite: () => column('integer'),
      })(),
    };
  },
});
