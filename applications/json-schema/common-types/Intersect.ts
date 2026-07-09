import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genJsonSchema, JsonSchemaExtension } from '../extension.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Intersect.js' {
  interface Intersect<T> extends JsonSchemaExtension<T extends JsonSchemaExtension[] ? true : false> {}
}

extend(S.Intersect, {
  get $jsonSchema() {
    if (this.allOf.some((s) => !s.$jsonSchema)) return;

    return () => ({
      ...callSuper(this, '$jsonSchema', S.Intersect),
      allOf: this.allOf.map((s, i) => genJsonSchema(i.toString(), s)),
    });
  },
} as ThisType<S.Intersect<(S.DataValue & JsonSchemaExtension)[]>>);
