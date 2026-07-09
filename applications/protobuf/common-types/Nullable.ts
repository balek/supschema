import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../extension.js';

declare module '@supschema/common-types/Nullable.js' {
  interface Nullable<S> extends ProtobufExtension<S extends ProtobufExtension ? true : false> {}
}

extend(S.Nullable, {
  get $protobuf() {
    if (!this.schema.$protobuf) return;

    const unionSchema = S.Union([S.Null(), this.schema]);
    return unionSchema.$protobuf;
  },
} as ThisType<S.Nullable<S.DataValue & ProtobufExtension<boolean>>>);
