import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { registerImport, ProtobufExtension } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Null.js' {
  interface Null extends ProtobufExtension {}
}

extend(S.Null, {
  $protobuf() {
    registerImport('google/protobuf');

    return {
      ...callSuper(this, '$protobuf', S.Null),
      type: 'NullValue',
    };
  },
});
