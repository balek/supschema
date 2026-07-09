import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../../extension.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/Int64.js' {
  interface Int64 extends ProtobufExtension {}
}
extend(S.Int64, {
  $protobuf() {
    return {
      ...callSuper(this, '$protobuf', S.Int64),
      type: 'int64',
    };
  },
});
