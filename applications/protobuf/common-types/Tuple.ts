import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { ProtobufExtended, ProtobufExtension, ProtobufField } from '../base.js';
import { mapToObj } from 'remeda';

declare module '@supschema/common-types/Tuple.js' {
  interface Tuple<T> extends ProtobufExtension<T extends ProtobufExtended[] ? true : false> {}
}

type ExtendedTuple = S.Tuple<(S.DataValue & ProtobufExtension)[]>;
extend(S.Tuple, {
  get $protobuf(): ExtendedTuple['$protobuf'] | undefined {
    if (this.items.some((s) => !s.$protobuf)) return;

    const objectSchema = S.Object(mapToObj(this.items, (s, i) => ['item' + i, ProtobufField(i, s)]));
    return objectSchema.$protobuf && (() => objectSchema.$protobuf());
  },
} as ThisType<ExtendedTuple>);
