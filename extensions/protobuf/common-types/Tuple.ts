import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtension } from '../extension';
import { mapToObj } from 'remeda';

declare module '@supschema/common-types/Tuple.js' {
  interface Tuple<T> extends ProtobufExtension<T extends ProtobufExtension[] ? true : false> {}
}

extend(S.Tuple, {
  get $protobuf(): ProtobufExtension<boolean>['$protobuf'] {
    if (this.items.some((s) => !s.$protobuf)) return;

    const objectSchema = S.Object(mapToObj(this.items, (s, i) => ['item' + i, s]));
    return objectSchema.$protobuf;
  },
} as ThisType<S.Tuple<(S.DataValue & ProtobufExtension)[]>>);
