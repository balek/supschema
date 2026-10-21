import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { byDialect, column, DrizzleExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/float/Float64.js' {
  interface Float64 extends DrizzleExtension {}
}

extend(S.Float64, {
  $drizzle() {
    return {
      ...callSuper(this, '$drizzle', S.Float64),
      ...byDialect({
        postgresql: () => column('doublePrecision'),
        mysql: () => column('double'),
        sqlite: () => column('real'),
      })(),
    };
  },
});
