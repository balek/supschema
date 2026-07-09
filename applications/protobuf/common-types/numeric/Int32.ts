import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../../extension.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/Int32.js' {
  interface Int32 extends ProtobufExtension {}
}
extend(S.Int32, {
  $protobuf() {
    return {
      ...callSuper(this, '$protobuf', S.Int32),
      type: 'int32',
    };
  },
});
