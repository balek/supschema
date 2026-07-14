import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { catchDefinitions, define, genProtobufField, ProtobufExtended, ProtobufExtension } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';
import { mapToObj } from 'remeda';

declare module '@supschema/common-types/Union.js' {
  interface Union<T> extends ProtobufExtension<T extends ProtobufExtended[] ? true : false> {}
}

type ExtendedUnion = S.Union<(S.DataValue & ProtobufExtension)[]>;
extend(S.Union, {
  get $protobuf(): ExtendedUnion['$protobuf'] | undefined {
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
} as ThisType<ExtendedUnion>);
