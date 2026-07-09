import { createType, defineConstructor, Schema, SchemaOptions } from '@supschema/core';
import { OpenApiOrJsonSchemaExtension } from './extension';

export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

export interface HttpEndpoint<
  Params extends Record<string, OpenApiOrJsonSchemaExtension> = Record<string, OpenApiOrJsonSchemaExtension>,
  Responses extends Record<number, OpenApiOrJsonSchemaExtension> = Record<number, OpenApiOrJsonSchemaExtension>,
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
    <
      Params extends Record<string, OpenApiOrJsonSchemaExtension>,
      Responses extends Record<number, OpenApiOrJsonSchemaExtension>,
    >(
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
