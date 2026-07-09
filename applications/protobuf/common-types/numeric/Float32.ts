import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../../extension.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/float/Float32.js' {
  interface Float32 extends ProtobufExtension {}
}
extend(S.Float32, {
  $protobuf() {
    return {
      ...callSuper(this, '$protobuf', S.Float32),
      type: 'float',
    };
  },
});
