import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { define, ProtobufExtension } from '../extension.js';
import { callSuper } from '@supschema/core/utils.js';
import { mapToObj } from 'remeda';

declare module '@supschema/common-types/Enum.js' {
  interface Enum<V> extends ProtobufExtension {}
}

extend(S.Enum, {
  $protobuf(baseRef) {
    const ref =
      baseRef?.ref ??
      define('', () => ({
        values: mapToObj(Object.entries(this.values), ([k], i) => [k, i]),
      }));

    return {
      ...callSuper(this, '$protobuf', S.Enum),
      type: ref,
    };
  },
});
