import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { dialect, DrizzleExtension, DrizzleExtended, jsonColumn } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Array.js' {
  interface Array<S> extends DrizzleExtension<S extends DrizzleExtended ? true : false> {}
}

type ExtendedArray = S.Array<S.DataValue & DrizzleExtended>;
extend(S.Array, {
  get $drizzle(): ExtendedArray['$drizzle'] | undefined {
    if (!this.items.$drizzle) return;

    return () => {
      const base = callSuper(this, '$drizzle', S.Array);
      // Only PostgreSQL supports native arrays, and only of scalar non-nullable values
      if (
        dialect !== 'postgresql' ||
        this.items instanceof S.Array ||
        this.items instanceof S.Nullable ||
        this.items instanceof S.Object
      )
        return { ...base, ...jsonColumn() };

      const item = this.items.$drizzle();
      return { ...base, builder: item.builder, args: item.args, modifiers: [...(item.modifiers ?? []), '.array()'] };
    };
  },
} as ThisType<ExtendedArray>);
