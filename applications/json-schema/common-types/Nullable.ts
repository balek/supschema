import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genJsonSchema, JsonSchemaExtension } from '../extension.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Nullable.js' {
  interface Nullable<S> extends JsonSchemaExtension<S extends JsonSchemaExtension ? true : false> {}
}

extend(S.Nullable, {
  get $jsonSchema() {
    if (!this.schema.$jsonSchema) return;

    return () => {
      const base = genJsonSchema('', this.schema);
      return {
        ...callSuper(this, '$jsonSchema', S.Nullable),
        ...(base.type ? { type: ['null'].concat(base.type) } : { anyOf: [{ type: 'null' }, base] }),
      };
    };
  },
} as ThisType<S.Nullable<S.DataValue & JsonSchemaExtension>>);
