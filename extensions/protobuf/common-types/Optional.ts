import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../extension';

declare module '@supschema/common-types/object/Optional.js' {
  interface Optional<S> extends ProtobufExtension<S extends ProtobufExtension ? true : false> {}
}

extend(S.Optional, {
  get $protobuf() {
    return this.schema.$protobuf;
  },
} as ThisType<S.Optional<S.DataValue & ProtobufExtension>>);
