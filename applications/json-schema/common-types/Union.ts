import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genJsonSchema, JsonSchemaExtended, JsonSchemaExtension } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Union.js' {
  interface Union<T> extends JsonSchemaExtension<T extends JsonSchemaExtended[] ? true : false> {}
}

extend(S.Union, {
  get $jsonSchema() {
    if (this.anyOf.some((s) => !s.$jsonSchema)) return;

    return () => ({
      ...callSuper(this, '$jsonSchema', S.Union),
      anyOf: this.anyOf.map((s, i) => genJsonSchema(i.toString(), s)),
    });
  },
} as ThisType<S.Union<(S.DataValue & JsonSchemaExtension)[]>>);
