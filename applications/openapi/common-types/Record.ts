import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genOpenApiSchema, isOpenApiSchema, OpenApiExtended, OpenApiExtension } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Record.js' {
  interface Record<K, V> extends OpenApiExtension<V extends OpenApiExtended ? true : false> {}
}

extend(S.Record, {
  get $openApi() {
    if (!isOpenApiSchema(this.keys) || !isOpenApiSchema(this.values)) return;

    return () => ({
      ...callSuper(this, '$openApi', S.Record),
      type: 'object' as const,
      propertyNames: genOpenApiSchema('propertyNames', this.keys),
      additionalProperties: genOpenApiSchema('additionalProperties', this.values),
    });
  },
} as ThisType<S.Record<S.String & OpenApiExtension, S.DataValue & OpenApiExtension>>);
