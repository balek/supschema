import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { JsonSchemaExtension } from '../extension';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/float/Float.js' {
  interface Float extends JsonSchemaExtension {}
}

extend(S.Float, {
  $jsonSchema() {
    return {
      ...callSuper(this, '$jsonSchema', S.Float),
      type: 'number' as const,
    };
  },
});
