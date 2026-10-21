import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { column, dialect, DrizzleExtension } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/String.js' {
  interface String extends DrizzleExtension {}
}

extend(S.String, {
  $drizzle() {
    return {
      ...callSuper(this, '$drizzle', S.String),
      ...(this.maxLength !== undefined && dialect !== 'sqlite'
        ? column('varchar', { length: this.maxLength })
        : column('text')),
    };
  },
});
