import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { JsonSchemaExtension } from '../extension';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/String.js' {
  interface String extends JsonSchemaExtension {}
}

extend(S.String, {
  $jsonSchema() {
    return {
      ...callSuper(this, '$jsonSchema', S.String),
      type: 'string' as const,
      minLength: this.minLength,
      maxLength: this.maxLength,
      pattern: this.pattern,
    };
  },
});
