import { defineConstructor, createType, SchemaOptions } from '@supschema/core';
import { DataValue } from '../DataValue.js';
import { Optional } from './Optional.js';

export type ObjectProperties = Record<string, DataValue>;

export interface Object<P extends ObjectProperties = ObjectProperties> extends DataValue {
  properties: P;
}

export const Object = createType(
  import.meta,
  DataValue,
  defineConstructor(
    <P extends ObjectProperties>(
      properties: P,
      opts?: Omit<SchemaOptions<Object<P>>, 'properties'>,
    ): SchemaOptions<Object<P>> => ({
      properties,
      ...opts,
    }),
  ),
  ({ properties, ...opts }) => [properties, opts] as const,
);
export default Object;

export type AllPropertiesExtend<P extends ObjectProperties, C> = {
  [K in keyof P]: P[K] extends C ? true : false;
}[keyof P] extends true
  ? true
  : false;

declare module '../DataValue.js' {
  export interface DataValue {
    optional?: boolean;
  }
}

export type OptionalPropertyKeys<P extends ObjectProperties> = {
  [K in keyof P]: P[K] extends Optional<DataValue> ? K : never;
}[keyof P];
export type RequiredPropertyKeys<P extends ObjectProperties> = keyof Omit<P, OptionalPropertyKeys<P>>;
