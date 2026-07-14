import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genPrismaField, PrismaExtension, PrismaExtended } from '../application.js';
import { callSuper } from '@supschema/core/utils.js';
import { Nullable } from '@supschema/common-types/Nullable.js';

declare module '@supschema/common-types/Array.js' {
  interface Array<S> extends PrismaExtension<
    S extends Array ? false : S extends Nullable ? false : S extends PrismaExtended ? true : false
  > {}
}

type ExtendedArray = S.Array<S.DataValue & PrismaExtended>;
extend(S.Array, {
  // oxlint-disable-next-line typescript/no-redundant-type-constituents
  get $prisma(): ExtendedArray['$prisma'] | undefined {
    if (!this.items.$prisma || this.items instanceof S.Array || this.items instanceof S.Nullable) return;

    return () => {
      return {
        ...genPrismaField('Item', this.items),
        ...callSuper(this, '$prisma', S.Array),
        array: true,
      };
    };
  },
} as ThisType<ExtendedArray>);
