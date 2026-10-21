import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { DrizzleExtension } from '../base.js';
import { findDescriptorInPrototypeChain } from '@supschema/core/utils.js';

type ExtendedDataValue = S.DataValue & DrizzleExtension<boolean>;
extend(
  S.DataValue,
  {
    get $drizzle(): ExtendedDataValue['$drizzle'] {
      if (!findDescriptorInPrototypeChain(this, '$drizzle', S.DataValue)) return;

      return () =>
        ({
          title: this.title,
          description: this.description,
          unique: 'unique' in this && !!this.unique,
        }) as never;
    },
  } as ThisType<ExtendedDataValue>,
  { memoGetters: false },
);
