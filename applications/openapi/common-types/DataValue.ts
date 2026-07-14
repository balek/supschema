import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { OpenApiExtension } from '../base.js';
import { findDescriptorInPrototypeChain } from '@supschema/core/utils.js';

extend(
  S.DataValue,
  {
    get $openApi() {
      if (!findDescriptorInPrototypeChain(this, '$openApi', S.DataValue)) return;

      return () => ({
        title: this.title,
        description: this.description,
        deprecated: this.deprecated,
      });
    },
  } as S.DataValue & OpenApiExtension<boolean>,
  { memoGetters: false },
);
