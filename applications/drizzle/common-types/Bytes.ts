import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { byDialect, column, customTypeColumn, DrizzleExtension } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Bytes.js' {
  interface Bytes extends DrizzleExtension {}
}

extend(S.Bytes, {
  $drizzle() {
    return {
      ...callSuper(this, '$drizzle', S.Bytes),
      ...byDialect({
        postgresql: () => customTypeColumn('bytea'),
        mysql: () => customTypeColumn('longblob'),
        sqlite: () => column('blob', { mode: 'buffer' }),
      })(),
    };
  },
});
