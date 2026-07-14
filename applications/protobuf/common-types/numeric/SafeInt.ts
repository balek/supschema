import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../../base.js';
import { getSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/numeric/integer/SafeInt.js' {
  interface SafeInt extends ProtobufExtension {}
}
extend(S.SafeInt, {
  $protobuf() {
    return {
      ...getSuper(this, '$protobuf', S.SafeInt)?.call(this),
      type: 'int64',
    };
  },
});
