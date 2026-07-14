import { modifyOpts, Schema } from '@supschema/core';

export const AutoIncrement = <S extends Schema>(schema: S): S => modifyOpts(schema, { autoIncrement: true } as never);

export const Unique = <S extends Schema>(schema: S): S => modifyOpts(schema, { unique: true } as never);
