import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { byDialect, column, DrizzleExtension, getEnumRef } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Enum.js' {
  interface Enum<V> extends DrizzleExtension {
    dbSchema?: string;
  }
}

extend(S.Enum, {
  $drizzle() {
    const values = Object.keys(this.values);
    return {
      ...callSuper(this, '$drizzle', S.Enum),
      ...byDialect({
        postgresql: () => ({ builder: getEnumRef(this) }),
        mysql: () => column('mysqlEnum', values),
        sqlite: () => column('text', { enum: values }),
      })(),
    };
  },
});
