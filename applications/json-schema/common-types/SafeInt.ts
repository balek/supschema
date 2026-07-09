import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { JsonSchemaExtension } from '../extension.js';
import { getSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/SafeInt.js' {
  interface SafeInt extends JsonSchemaExtension {}
}

extend(S.SafeInt, {
  $jsonSchema() {
    return {
      ...getSuper(this, '$jsonSchema', S.SafeInt)?.call(this),
      type: 'integer' as const,
    };
  },
});
