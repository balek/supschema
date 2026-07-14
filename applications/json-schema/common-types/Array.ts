import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genJsonSchema, JsonSchemaExtended, JsonSchemaExtension } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Array.js' {
  interface Array<S> extends JsonSchemaExtension<S extends JsonSchemaExtended ? true : false> {}
}

extend(S.Array, {
  get $jsonSchema(): JsonSchemaExtension<boolean>['$jsonSchema'] {
    if (!this.items.$jsonSchema) return;

    return () => {
      return {
        ...callSuper(this, '$jsonSchema', S.Array),
        type: 'array' as const,
        items: genJsonSchema('items', this.items),
        minItems: this.minItems,
        maxItems: this.maxItems,
        contains: this.contains,
        minContains: this.minContains,
        maxContains: this.maxContains,
        prefixItems: this.prefixItems,
        uniqueItems: this.uniqueItems,
      };
    };
  },
} as ThisType<S.Array<S.DataValue & JsonSchemaExtension>>);
