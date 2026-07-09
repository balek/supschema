import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { JsonSchemaExtension } from '../extension.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Enum.js' {
  interface Enum<V> extends JsonSchemaExtension {}
}

extend(S.Enum, {
  $jsonSchema() {
    return {
      ...callSuper(this, '$jsonSchema', S.Enum),
      type: 'string',
      enum: Object.keys(this.values),
    };
  },
});
