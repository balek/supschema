import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genJsonSchema, JsonSchemaExtended, JsonSchemaExtension } from '../extension.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Record.js' {
  interface Record<K, V> extends JsonSchemaExtension<V extends JsonSchemaExtended ? true : false> {}
}

extend(S.Record, {
  get $jsonSchema() {
    if (!this.keys.$jsonSchema || !this.values.$jsonSchema) return;

    return () => ({
      ...callSuper(this, '$jsonSchema', S.Record),
      type: 'object' as const,
      propertyNames: genJsonSchema('propertyNames', this.keys),
      additionalProperties: genJsonSchema('additionalProperties', this.values),
    });
  },
} as ThisType<S.Record<S.String & JsonSchemaExtension, S.DataValue & JsonSchemaExtension>>);
