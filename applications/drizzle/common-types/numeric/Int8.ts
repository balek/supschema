import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { byDialect, column, DrizzleExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/Int8.js' {
  interface Int8 extends DrizzleExtension {}
}

extend(S.Int8, {
  $drizzle() {
    return {
      ...callSuper(this, '$drizzle', S.Int8),
      ...byDialect({
        postgresql: () => column('smallint'),
        mysql: () => column('tinyint'),
        sqlite: () => column('integer'),
      })(),
    };
  },
});
