import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { JsonSchemaExtension } from '../extension';
import { findDescriptorInPrototypeChain, getSuper } from '@supschema/core/utils.js';

extend(
  S.Numeric,
  {
    get $jsonSchema() {
      if (!findDescriptorInPrototypeChain(this, '$jsonSchema', S.Numeric)) return;

      return () => ({
        ...getSuper(this, '$jsonSchema', S.Numeric)?.call(this),
        exclusiveMaximum: this.exclusiveMaximum,
        exclusiveMinimum: this.exclusiveMinimum,
        maximum: this.maximum,
        minimum: this.minimum,
        multipleOf: this.multipleOf,
      });
    },
  } as S.Numeric & JsonSchemaExtension,
  { memoGetters: false },
);
