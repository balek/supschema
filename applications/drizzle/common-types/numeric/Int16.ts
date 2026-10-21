import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { byDialect, column, DrizzleExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/Int16.js' {
  interface Int16 extends DrizzleExtension {}
}

extend(S.Int16, {
  $drizzle() {
    return {
      ...callSuper(this, '$drizzle', S.Int16),
      ...byDialect({
        postgresql: () => column('smallint'),
        mysql: () => column('smallint'),
        sqlite: () => column('integer'),
      })(),
    };
  },
});
