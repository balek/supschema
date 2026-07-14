import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/UInt64.js' {
  interface UInt64 extends ProtobufExtension {}
}
extend(S.UInt64, {
  $protobuf() {
    return {
      ...callSuper(this, '$protobuf', S.UInt64),
      type: 'uint64',
    };
  },
});
