import Schema, { SchemaOptions } from './Schema.js';

export interface OptionsModification<S extends Schema> {
  originalSchema: S;
  options: Partial<SchemaOptions<S>>;
}
const MODIFICATION_KEY = '$modification';
export const modifyOpts = <S extends Schema>(originalSchema: S, options: Partial<SchemaOptions<S>>): S => {
  const newSchema = { ...originalSchema, ...options };
  Object.setPrototypeOf(newSchema, Object.getPrototypeOf(originalSchema));
  Object.defineProperty(newSchema, MODIFICATION_KEY, {
    enumerable: false,
    value: {
      originalSchema,
      options,
    },
  });
  return newSchema;
};
export const extractOptionsModification = <S extends Schema>(schema: S) =>
  MODIFICATION_KEY in schema ? (schema[MODIFICATION_KEY] as OptionsModification<S>) : undefined;
