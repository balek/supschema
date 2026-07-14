import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { JsonSchemaExtension } from '../base.js';
import { findDescriptorInPrototypeChain } from '@supschema/core/utils.js';

extend(
  S.DataValue,
  {
    get $jsonSchema() {
      if (!findDescriptorInPrototypeChain(this, '$jsonSchema', S.DataValue)) return;

      return () => ({
        title: this.title,
        description: this.description,
        deprecated: this.deprecated,
      });
    },
  } as S.DataValue & JsonSchemaExtension<boolean>,
  { memoGetters: false },
);
