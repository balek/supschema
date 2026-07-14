import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genOpenApiSchema, isOpenApiSchema, OpenApiExtended, OpenApiExtension } from '../extension.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Array.js' {
  interface Array<S> extends OpenApiExtension<S extends OpenApiExtended ? true : false> {}
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
