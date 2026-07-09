import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { JsonSchemaExtension } from '../extension.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Null.js' {
  interface Null extends JsonSchemaExtension {}
}

extend(S.Null, {
  $jsonSchema() {
    return {
      ...callSuper(this, '$jsonSchema', S.Null),
      type: 'null' as const,
    };
  },
});
