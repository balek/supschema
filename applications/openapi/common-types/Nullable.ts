import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genOpenApiSchema, isOpenApiSchema, OpenApiExtended, OpenApiExtension } from '../extension.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Nullable.js' {
  interface Nullable<S> extends OpenApiExtension<S extends OpenApiExtended ? true : false> {}
}

extend(S.Nullable, {
  get $openApi() {
    if (!isOpenApiSchema(this.schema)) return;

    return () => {
      const base = genOpenApiSchema('', this.schema);
      return {
        ...callSuper(this, '$openApi', S.Nullable),
        ...(base.type ? { type: ['null'].concat(base.type) } : { anyOf: [{ type: 'null' }, base] }),
      };
    };
  },
} as ThisType<S.Nullable<S.DataValue & OpenApiExtension>>);
