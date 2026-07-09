import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { catchDefinitions, define, genProtobufField, ProtobufExtension } from '../extension.js';
import { callSuper } from '@supschema/core/utils.js';
import { mapToObj, mapValues } from 'remeda';

declare module '@supschema/common-types/object/Object.js' {
  interface Object<P> extends ProtobufExtension<AllPropertiesExtend<P, ProtobufExtension<any>>> {}
}

extend(S.Object, {
  get $protobuf(): ProtobufExtension<boolean>['$protobuf'] {
    if (Object.values(this.properties).some((p) => !p.$protobuf)) return;

    return (baseRef) => {
      const ref =
        baseRef?.ref ??
        define('', () => {
          const { result, definitions } = catchDefinitions(() =>
            mapValues(this.properties, (s, key) => genProtobufField(key, s)),
          );

          return {
            fields: mapToObj(Object.entries(result), ([key, field], i) => [key, { ...field, id: i }]),
            nested: definitions,
          };
        });

      return { ...callSuper(this, '$protobuf', S.Object, baseRef), type: ref };
    };
  },
} as ThisType<S.Object<{ [K: string]: S.DataValue & ProtobufExtension }>>);
