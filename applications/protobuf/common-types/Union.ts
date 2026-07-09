import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { catchDefinitions, define, genProtobufField, ProtobufExtension } from '../extension.js';
import { callSuper } from '@supschema/core/utils.js';
import { mapToObj } from 'remeda';

declare module '@supschema/common-types/Union.js' {
  interface Union<T> extends ProtobufExtension<T extends ProtobufExtension[] ? true : false> {}
}

extend(S.Union, {
  get $protobuf(): ProtobufExtension<boolean>['$protobuf'] {
    if (this.anyOf.some((p) => !p.$protobuf)) return;

    return (baseRef) => {
      const ref =
        baseRef?.ref ??
        define('', () => {
          const { result, definitions } = catchDefinitions(() =>
            this.anyOf.map((s, index) => genProtobufField(index.toString(), s)),
          );

          return {
            oneofs: {
              union: {
                oneof: result.map((f, i) => 'option' + i),
              },
            },
            fields: mapToObj(result, (field, i) => ['option' + i, { ...field, id: i }]),
            nested: definitions,
          };
        });

      return { ...callSuper(this, '$protobuf', S.Union, baseRef), type: ref };
    };
  },
} as ThisType<S.Union<(S.DataValue & ProtobufExtension)[]>>);
