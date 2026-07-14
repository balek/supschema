import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genOpenApiSchema, isOpenApiSchema, OpenApiExtended, OpenApiExtension } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Union.js' {
  interface Union<T> extends OpenApiExtension<T extends OpenApiExtended[] ? true : false> {}
}

extend(S.Union, {
  get $openApi() {
    if (this.anyOf.some((s) => !isOpenApiSchema(s))) return;

    return () => ({
      ...callSuper(this, '$openApi', S.Union),
      anyOf: this.anyOf.map((s, i) => genOpenApiSchema(i.toString(), s)),
    });
  },
} as ThisType<S.Union<(S.DataValue & OpenApiExtension)[]>>);
