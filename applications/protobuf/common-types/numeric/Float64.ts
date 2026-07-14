import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/float/Float64.js' {
  interface Float64 extends ProtobufExtension {}
}
extend(S.Float64, {
  $protobuf() {
    return {
      ...callSuper(this, '$protobuf', S.Float64),
      type: 'double',
    };
  },
});
