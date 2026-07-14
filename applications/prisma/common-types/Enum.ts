import { extend } from '@supschema/core';
import { S } from '@supschema/common-types';
import { define, generateObjectDescription, PrismaExtension } from '../base.js';
import { callSuper } from '@supschema/core/utils.js';

declare module '@supschema/common-types/Enum.js' {
  interface Enum<V> extends PrismaExtension {
    dbSchema?: string;
  }
}

extend(S.Enum, {
  $prisma(baseRef) {
    const ref =
      baseRef?.schema.values === this.values
        ? baseRef.ref
        : define('', () => ({
            type: 'enum',
            description: generateObjectDescription(this),
            enumerators: [
              ...Object.entries(this.values).flatMap(([key, meta]) => [
                ...(meta.description ? [{ type: 'comment', text: '/// ' + meta.description }] : []),
                { type: 'enumerator', name: key, comment: '/// ' + meta.title },
              ]),
              ...(this.dbSchema
                ? [
                    {
                      type: 'attribute',
                      kind: 'object',
                      name: 'schema',
                      args: [{ type: 'attributeArgument', value: this.dbSchema }],
                    },
                  ]
                : []),
            ],
          }));

    return { ...callSuper(this, '$prisma', S.Enum, baseRef), fieldType: ref };
  },
});
