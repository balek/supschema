import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { JsonSchemaExtension } from '../extension';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Boolean.js' {
  interface Boolean extends JsonSchemaExtension {}
}

extend(S.Boolean, {
  $jsonSchema() {
    return {
      ...callSuper(this, '$jsonSchema', S.Boolean),
      type: 'boolean',
    };
  },
});
