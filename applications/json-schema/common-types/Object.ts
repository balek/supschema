import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genJsonSchema, JsonSchemaExtension } from '../extension.js';
import { callSuper } from '@supschema/core/utils.js';
import { mapValues } from 'remeda';

declare module '@supschema/common-types/object/Object.js' {
  interface Object<P> extends JsonSchemaExtension<AllPropertiesExtend<P, JsonSchemaExtension<any>>> {}
}

extend(S.Object, {
  get $jsonSchema() {
    const required: string[] = [];
    for (const [key, prop] of Object.entries(this.properties)) {
      if (!prop.$jsonSchema) return undefined;
      if (!(prop instanceof S.Optional)) required.push(key);
    }

    return () => ({
      ...callSuper(this, '$jsonSchema', S.Object),
      type: 'object' as const,
      properties: mapValues(this.properties, (s, key) => genJsonSchema(key, s)),
      required,
    });
  },
} as ThisType<S.Object<{ [K: string]: S.DataValue & JsonSchemaExtension }>>);
