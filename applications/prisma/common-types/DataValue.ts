import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { PrismaExtension } from '../base.js';
import { findDescriptorInPrototypeChain } from '@supschema/core/utils.js';

type ExtendedDataValue = S.DataValue & PrismaExtension<boolean>;
extend(
  S.DataValue,
  {
    get $prisma(): ExtendedDataValue['$prisma'] {
      if (!findDescriptorInPrototypeChain(this, '$prisma', S.DataValue)) return;

      return (baseRef) =>
        ({
          comment: baseRef?.schema.title === this.title ? undefined : '/// ' + this.title,
          description: baseRef?.schema.description === this.description ? undefined : `/// ${this.description}`,
          ...('unique' in this && this.unique
            ? {
                attributes: [
                  {
                    type: 'attribute',
                    kind: 'field',
                    name: 'unique',
                  },
                ],
              }
            : {}),
        }) as never;
    },
  } as ThisType<ExtendedDataValue>,
  { memoGetters: false },
);
