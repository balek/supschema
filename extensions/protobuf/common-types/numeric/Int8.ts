import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../../extension';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/Int8.js' {
  interface Int8 extends ProtobufExtension {}
}
extend(S.Int8, {
  $protobuf() {
    return {
      ...callSuper(this, '$protobuf', S.Int8),
      type: 'int32',
    };
  },
});
