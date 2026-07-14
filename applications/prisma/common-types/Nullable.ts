import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { genPrismaField, PrismaExtension, PrismaExtended } from '../application.js';

declare module '@supschema/common-types/Nullable.js' {
  interface Nullable<S> extends PrismaExtension<S extends PrismaExtended ? true : false> {}
}

type ExtendedNullable = S.Nullable<S.DataValue & PrismaExtended>;
extend(S.Nullable, {
  get $prisma(): ExtendedNullable['$prisma'] | undefined {
    if (!this.schema.$prisma) return;

    return () => ({
      ...genPrismaField('', this.schema),
      optional: true,
    });
  },
} as ThisType<ExtendedNullable>);
