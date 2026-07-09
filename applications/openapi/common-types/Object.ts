import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genOpenApiSchema, isOpenApiSchema, OpenApiExtension } from '../extension.js';
import { callSuper } from '@supschema/core/utils.js';
import { mapValues } from 'remeda';

declare module '@supschema/common-types/object/Object.js' {
  interface Object<P> extends OpenApiExtension<AllPropertiesExtend<P, OpenApiExtension<any>>> {}
}

extend(S.Object, {
  get $openApi() {
    const required: string[] = [];
    for (const [key, prop] of Object.entries(this.properties)) {
      if (!isOpenApiSchema(prop)) return undefined;
      if (!(prop instanceof S.Optional)) required.push(key);
    }

    return () => ({
      ...callSuper(this, '$openApi', S.Object),
      type: 'object' as const,
      properties: mapValues(this.properties, (s, key) => genOpenApiSchema(key, s)),
      required,
    });
  },
} as ThisType<S.Object<{ [K: string]: S.DataValue & OpenApiExtension }>>);
