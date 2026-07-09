import { defineConstructor, createType, SchemaOptions } from '@supschema/core';
import { Evaluate } from '@supschema/core/utils.js';
import { Object, ObjectProperties } from './Object.js';

export interface Omit<P extends ObjectProperties> extends Object<P> {
  object: Object<any>;
  keys: readonly string[];
}

export const Omit = createType(
  import.meta,
  Object,
  defineConstructor(
    <P extends ObjectProperties, K extends (keyof P & string)[]>(
      object: Object<P>,
      keys: readonly [...K],
      opts?: globalThis.Omit<SchemaOptions<Omit<globalThis.Omit<P, K[number]>>>, 'object' | 'keys' | 'properties'>,
    ): SchemaOptions<Omit<Evaluate<globalThis.Omit<P, K[number]>>>> =>
      ({
        properties: globalThis.Object.fromEntries(
          globalThis.Object.entries(object.properties).filter(([k]) => !keys.includes(k)),
        ),
        object,
        keys,
        ...opts,
      }) as never,
  ),
  ({ properties: _, object, keys, ...opts }) => [object, keys, opts] as const,
);
export default Omit;
