import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genJsonSchema, JsonSchemaExtension } from '../extension.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Tuple.js' {
  interface Tuple<T> extends JsonSchemaExtension<T extends JsonSchemaExtension[] ? true : false> {}
}

extend(S.Tuple, {
  get $jsonSchema() {
    if (this.items.some((s) => !s.$jsonSchema)) return;

    return () => ({
      ...callSuper(this, '$jsonSchema', S.Tuple),
      type: 'array' as const,
      prefixItems: this.items.map((s, i) => genJsonSchema(i.toString(), s)),
      items: false as const,
    });
  },
} as ThisType<S.Tuple<(S.DataValue & JsonSchemaExtension)[]>>);
