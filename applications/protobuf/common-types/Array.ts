import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { catchDefinitions, define, genProtobufField, ProtobufExtended, ProtobufExtension } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Array.js' {
  interface Array<S> extends ProtobufExtension<S extends ProtobufExtended ? true : false> {}
}

extend(S.Array, {
  get $protobuf() {
    if (!this.items.$protobuf) return;

    return () => {
      if (!(this.items instanceof S.Array)) return { ...genProtobufField('Item', this.items), rule: 'repeated' };

      const type = define('Item', () => {
        const { result, definitions } = catchDefinitions(() => genProtobufField('', this.items));

        return {
          fields: { item: { ...result, id: 0 } },
          nested: definitions,
        };
      });

      return {
        ...callSuper(this, '$protobuf', S.Array),
        type,
        rule: 'repeated',
      };
    };
  },
} as ThisType<S.Array<S.DataValue & ProtobufExtension>>);
