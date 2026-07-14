import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtended, ProtobufExtension } from '../base.js';

declare module '@supschema/common-types/object/Optional.js' {
  interface Optional<S> extends ProtobufExtension<S extends ProtobufExtended ? true : false> {}
}

extend(S.Optional, {
  get $protobuf() {
    return this.schema.$protobuf;
  },
} as ThisType<S.Optional<S.DataValue & ProtobufExtension>>);
