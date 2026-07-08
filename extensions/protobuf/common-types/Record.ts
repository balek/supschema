import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genProtobufField, ProtobufExtension } from '../extension';

declare module '@supschema/common-types/Record.js' {
  interface Record<K, V> extends ProtobufExtension<
    // oxlint-disable-next-line typescript/no-wrapper-object-types
    K extends String ? (V extends ProtobufExtension ? true : false) : false
  > {}
}

extend(S.Record, {
  get $protobuf() {
    if (!(this.keys instanceof S.String) || !this.values.$protobuf) return;

    return () => ({
      ...genProtobufField('Value', this.values),
      keyType: 'string',
    });
  },
} as ThisType<S.Record<S.String, S.DataValue & ProtobufExtension>>);
