import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/UInt8.js' {
  interface UInt8 extends ProtobufExtension {}
}
extend(S.UInt8, {
  $protobuf() {
    return {
      ...callSuper(this, '$protobuf', S.UInt8),
      type: 'uint32',
    };
  },
});
