import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/UInt16.js' {
  interface UInt16 extends ProtobufExtension {}
}
extend(S.UInt16, {
  $protobuf() {
    return {
      ...callSuper(this, '$protobuf', S.UInt16),
      type: 'uint32',
    };
  },
});
