import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genOpenApiSchema, isOpenApiSchema, OpenApiExtended, OpenApiExtension } from '../extension.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Tuple.js' {
  interface Tuple<T> extends OpenApiExtension<T extends OpenApiExtended[] ? true : false> {}
}

extend(S.Tuple, {
  get $openApi() {
    if (this.items.some((s) => !isOpenApiSchema(s))) return;

    return () => ({
      ...callSuper(this, '$openApi', S.Tuple),
      type: 'array' as const,
      prefixItems: this.items.map((s, i) => genOpenApiSchema(i.toString(), s)),
      items: false as const,
    });
  },
} as ThisType<S.Tuple<(S.DataValue & OpenApiExtension)[]>>);
