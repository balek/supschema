import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genOpenApiSchema, isOpenApiSchema, OpenApiExtension } from '../extension';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Array.js' {
  interface Array<S> extends OpenApiExtension<S extends OpenApiExtension ? true : false> {}
}

extend(S.Array, {
  get $openApi() {
    if (!isOpenApiSchema(this.items)) return;

    return () => ({
      ...callSuper(this, '$openApi', S.Array),
      type: 'array' as const,
      items: genOpenApiSchema('items', this.items),
      minItems: this.minItems,
      maxItems: this.maxItems,
      contains: this.contains,
      minContains: this.minContains,
      maxContains: this.maxContains,
      prefixItems: this.prefixItems,
      uniqueItems: this.uniqueItems,
    });
  },
} as ThisType<S.Array<S.DataValue & OpenApiExtension>>);
