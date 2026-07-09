import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../../extension.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/Int16.js' {
  interface Int16 extends ProtobufExtension {}
}
extend(S.Int16, {
  $protobuf() {
    return {
      ...callSuper(this, '$protobuf', S.Int16),
      type: 'int32',
    };
  },
});
