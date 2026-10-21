import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { byDialect, column, DrizzleExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/float/Float32.js' {
  interface Float32 extends DrizzleExtension {}
}

extend(S.Float32, {
  $drizzle() {
    return {
      ...callSuper(this, '$drizzle', S.Float32),
      ...byDialect({
        postgresql: () => column('real'),
        mysql: () => column('float'),
        sqlite: () => column('real'),
      })(),
    };
  },
});
