import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import {
  define,
  PrismaExtension,
  PrismaExtended,
  genPrismaProperties,
  PrismaExtendedProperties,
  generateObjectDescription,
} from '../application.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/object/Object.js' {
  interface Object<P> extends PrismaExtension<AllPropertiesExtend<P, PrismaExtended>> {}
}

type ExtendedObject = S.Object<PrismaExtendedProperties>;
extend(S.Object, {
  get $prisma(): ExtendedObject['$prisma'] | undefined {
    if (Object.values(this.properties).some((p) => !p.$prisma)) return;

    return (baseRef) => {
      const ref =
        baseRef?.schema.properties === this.properties
          ? baseRef.ref
          : define('', () => ({
              type: 'type',
              description: generateObjectDescription(this),
              properties: genPrismaProperties(this.properties),
            }));

      return { ...callSuper(this, '$prisma', S.Object, baseRef), fieldType: ref };
    };
  },
} as ThisType<ExtendedObject>);
