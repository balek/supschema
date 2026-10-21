import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { DrizzleExtension, DrizzleExtended } from '../base.js';

declare module '@supschema/common-types/Nullable.js' {
  interface Nullable<S> extends DrizzleExtension<S extends DrizzleExtended ? true : false> {}
}

type ExtendedNullable = S.Nullable<S.DataValue & DrizzleExtended>;
extend(S.Nullable, {
  get $drizzle(): ExtendedNullable['$drizzle'] | undefined {
    if (!this.schema.$drizzle) return;

    return () => ({
      ...this.schema.$drizzle(),
      nullable: true,
    });
  },
} as ThisType<ExtendedNullable>);
