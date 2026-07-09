import { modifyOpts, Schema } from '@supschema/core';

export type HttpParamType = 'query' | 'header' | 'path' | 'cookie';

export interface HttpParam {
  type: HttpParamType;
  name?: string;
}

export const HttpParam = <S extends Schema>(type: HttpParamType, name: string, schema: S) =>
  modifyOpts(schema, { httpParam: { type, name } satisfies HttpParam } as never);

export const extractHttpParam = (schema: Schema): HttpParam | undefined => (schema as any).httpParam;
