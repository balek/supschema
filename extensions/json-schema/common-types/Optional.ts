import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { JsonSchemaExtension } from '../extension';

declare module '@supschema/common-types/object/Optional.js' {
  interface Optional<S> extends JsonSchemaExtension<S extends JsonSchemaExtension ? true : false> {}
}

extend(S.Optional, {
  get $jsonSchema() {
    return this.schema.$jsonSchema;
  },
} as ThisType<S.Optional<S.DataValue & JsonSchemaExtension>>);
