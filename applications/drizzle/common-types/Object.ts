import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { DrizzleExtension, jsonColumn } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/object/Object.js' {
  interface Object<P> extends DrizzleExtension {}
}

extend(S.Object, {
  $drizzle() {
    return {
      ...callSuper(this, '$drizzle', S.Object),
      ...jsonColumn(),
    };
  },
});
