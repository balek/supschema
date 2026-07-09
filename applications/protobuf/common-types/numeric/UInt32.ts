import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../../extension.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/UInt32.js' {
  interface UInt32 extends ProtobufExtension {}
}
extend(S.UInt32, {
  $protobuf() {
    return {
      ...callSuper(this, '$protobuf', S.UInt32),
      type: 'uint32',
    };
  },
});
