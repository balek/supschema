import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Boolean.js' {
  interface Boolean extends ProtobufExtension {}
}

extend(S.Boolean, {
  $protobuf() {
    return {
      ...callSuper(this, '$protobuf', S.Boolean),
      type: 'bool',
    };
  },
});
