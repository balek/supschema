import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../extension.js';
import { findDescriptorInPrototypeChain } from '@supschema/core/utils.js';

extend(
  S.DataValue,
  {
    get $protobuf() {
      if (!findDescriptorInPrototypeChain(this, '$protobuf', S.DataValue)) return;

      return () => ({
        comment: (this.title ? `${this.title}\n` : '') + (this.description ?? ''),
      });
    },
  } as S.DataValue & ProtobufExtension<boolean>,
  { memoGetters: false },
);
