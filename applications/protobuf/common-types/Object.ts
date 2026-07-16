import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import {
  catchDefinitions,
  define,
  genProtobufField,
  ProtobufExtended,
  ProtobufExtension,
  ProtobufField,
} from '../base.js';
import { callSuper } from '@supschema/core/utils.js';
import { mapValues } from 'remeda';

declare module '@supschema/common-types/object/Object.js' {
  interface Object<P> extends ProtobufExtension<AllPropertiesExtend<P, ProtobufExtended & ProtobufField>> {}
}

type ExtendedObject = S.Object<{ [K: string]: S.DataValue & ProtobufExtension & ProtobufField }>;
extend(S.Object, {
  get $protobuf(): ExtendedObject['$protobuf'] | undefined {
    if (Object.values(this.properties).some((p) => !p.$protobuf)) return;

    return (baseRef) => {
      const ref =
        baseRef?.ref ??
        define('', () => {
          const { result: fields, definitions } = catchDefinitions(() =>
            mapValues(this.properties, (s, key) => ({ ...genProtobufField(key, s), id: s.protobufNumber })),
          );

          return {
            fields,
            nested: definitions,
          };
        });

      return { ...callSuper(this, '$protobuf', S.Object, baseRef), type: ref };
    };
  },
} as ThisType<ExtendedObject>);
