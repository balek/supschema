import { defineConstructor, createType, SchemaOptions } from '@supschema/core';
import { Object, ObjectProperties } from './Object.js';
import { Optional } from './Optional.js';

type PartialProperties<P extends ObjectProperties> = { [K in keyof P]: Optional<P[K]> };
export interface Partial<P extends ObjectProperties> extends Object<PartialProperties<P>> {
  object: Object<any>;
}

export const Partial = createType(
  import.meta,
  Object,
  defineConstructor(
    <P extends ObjectProperties>(
      object: Object<P>,
      opts?: globalThis.Omit<SchemaOptions<Partial<P>>, 'object' | 'properties'>,
    ): SchemaOptions<Partial<P>> => ({
      properties: globalThis.Object.fromEntries(
        globalThis.Object.entries(object.properties).map(([k, v]) => [k, Optional(v)]),
      ) as never,
      object,
      ...opts,
    }),
  ),
  ({ properties: _, object, ...opts }) => [object, opts] as const,
);
export default Partial;
