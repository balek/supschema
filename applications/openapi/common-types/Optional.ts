import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { OpenApiExtended, OpenApiExtension } from '../base.js';
import { JsonSchemaExtension } from '@supschema/json-schema/base.js';

declare module '@supschema/common-types/object/Optional.js' {
  interface Optional<S> extends OpenApiExtension<S extends OpenApiExtended ? true : false> {}
}

extend(S.Optional, {
  get $openApi() {
    return this.schema.$openApi ?? (this.schema as unknown as JsonSchemaExtension).$jsonSchema;
  },
} as ThisType<S.Optional<S.DataValue & OpenApiExtension>>);
