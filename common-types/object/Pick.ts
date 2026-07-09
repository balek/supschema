import { defineConstructor, createType, SchemaOptions } from '@supschema/core';
import { Evaluate } from '@supschema/core/utils.js';
import { Object, ObjectProperties } from './Object.js';

export interface Pick<P extends ObjectProperties> extends Object<P> {
  object: Object<any>;
  keys: readonly string[];
}

export const Pick = createType(
  import.meta,
  Object,
  defineConstructor(
    <P extends ObjectProperties, K extends (keyof P & string)[]>(
      object: Object<P>,
      keys: readonly [...K],
      opts?: Omit<SchemaOptions<Pick<globalThis.Pick<P, K[number]>>>, 'object' | 'keys' | 'properties'>,
    ): SchemaOptions<Pick<Evaluate<globalThis.Pick<P, K[number]>>>> =>
      ({
        properties: globalThis.Object.fromEntries(
          globalThis.Object.entries(object.properties).filter(([k]) => keys.includes(k)),
        ),
        object,
        keys,
        ...opts,
      }) as never,
  ),
  ({ properties: _, object, keys, ...opts }) => [object, keys, opts] as const,
);
export default Pick;
