import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { OpenApiExtension } from '../extension.js';
import { JsonSchemaExtension } from '@supschema/json-schema/extension.js';

declare module '@supschema/common-types/object/Optional.js' {
  interface Optional<S> extends OpenApiExtension<S extends OpenApiExtension ? true : false> {}
}

extend(S.Optional, {
  get $openApi() {
    return this.schema.$openApi ?? (this.schema as unknown as JsonSchemaExtension).$jsonSchema;
  },
} as ThisType<S.Optional<S.DataValue & OpenApiExtension>>);
