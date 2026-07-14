import { createType, defineConstructor, Schema, SchemaOptions } from '@supschema/core';
import { OpenApiExtended } from './extension.js';

export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

export interface HttpEndpoint<
  Params extends Record<string, OpenApiExtended> = Record<string, OpenApiExtended>,
  Responses extends Record<number, OpenApiExtended> = Record<number, OpenApiExtended>,
> extends Schema {
  path: string;
  method: HttpMethod;
  parameters: Params;
  responses: Responses;
}

export const HttpEndpoint = createType(
  import.meta,
  Schema,
  defineConstructor(
    <Params extends Record<string, OpenApiExtended>, Responses extends Record<number, OpenApiExtended>>(
      path: string,
      method: HttpMethod,
      parameters: Params,
      responses: Responses,
      opts?: Omit<SchemaOptions<HttpEndpoint<Params, Responses>>, 'path' | 'method' | 'parameters' | 'responses'>,
    ): SchemaOptions<HttpEndpoint<Params, Responses>> => ({
      path,
      method,
      parameters,
      responses,
      ...opts,
    }),
  ),
  ({ path, method, parameters, responses, ...opts }) => [path, method, parameters, responses, opts] as const,
);
export default HttpEndpoint;
