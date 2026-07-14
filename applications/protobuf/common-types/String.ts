import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/String.js' {
  interface String extends ProtobufExtension {}
}

extend(S.String, {
  $protobuf() {
    return {
      ...callSuper(this, '$protobuf', S.String),
      type: 'string',
    };
  },
});
