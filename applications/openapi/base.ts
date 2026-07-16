import { Schema } from '@supschema/core';
import type { OpenAPIV3_1 } from '@hey-api/spec-types';
import { JsonSchemaExtended } from '@supschema/json-schema/base.js';
import {
  currentNode,
  generateNode,
  generateRoot,
  withRegistry,
} from '@supschema/codegen-utils/astGeneration/dynamicTree.js';
import { AstFieldGenerator, GlobalDefinitionRegistry } from '@supschema/codegen-utils/astGeneration/common.js';
import { groupBy, mapToObj, mapValues, omitBy } from 'remeda';
import HttpEndpoint from './HttpEndpoint.js';
import { getRegistry } from '@supschema/codegen-utils/astGeneration/registry.js';
import { extractHttpParam } from './HttpParam.js';
import { writeFiles } from '@supschema/codegen-utils/fs.js';

export interface OpenApiExtension<T extends boolean = true> {
  $openApi: T extends true ? AstFieldGenerator<OpenAPIV3_1.SchemaObject, this> : undefined;
}
export type OpenApiExtended = { $openApi: AstFieldGenerator<OpenAPIV3_1.SchemaObject> } | JsonSchemaExtended;

export const isOpenApiSchema = (schema: Schema): schema is OpenApiExtended =>
  !!(schema as OpenApiExtension<boolean>).$openApi || !!(schema as JsonSchemaExtended).$jsonSchema;

export const genOpenApiSchema = (key: string, schema: OpenApiExtended): OpenAPIV3_1.SchemaObject =>
  generateNode(key, { nameSuffix: key }, () => {
    const base = getRegistry(GlobalDefinitionRegistry).getBaseRef(schema);
    const baseRef = base && {
      schema: base.baseSchema,
      get ref() {
        return '#/' + base.path.slice(1).join('/');
      },
    };

    if (baseRef?.schema === schema) return { $ref: baseRef.ref };

    const method = ('$openApi' in schema && schema.$openApi) || (schema as JsonSchemaExtended).$jsonSchema;

    return omitBy(method(baseRef), (v) => v === undefined) as never;
  });

export const generateOperationObject = (endpoint: HttpEndpoint): OpenAPIV3_1.OperationObject => ({
  parameters: Object.entries(endpoint.parameters)
    .filter(([key]) => key !== 'body')
    .map(([key, schema]) => ({
      name: extractHttpParam(schema)?.name ?? key,
      in: extractHttpParam(schema)?.type ?? 'query',
      schema: genOpenApiSchema(key, schema),
    })),
  ...(endpoint.parameters.body && {
    requestBody: { content: { 'application/json': { schema: genOpenApiSchema('body', endpoint.parameters.body) } } },
  }),
  responses: mapValues(endpoint.responses, (p, key) => ({ schema: genOpenApiSchema(key, p) })),
});

export interface OpenApiDescription extends Omit<OpenAPIV3_1.Document, 'components'> {
  endpoints: HttpEndpoint[];
  schemas?: Record<string, Schema & OpenApiExtended>;
}

export const generateOpenApiSpec = ({ endpoints, schemas, ...rest }: OpenApiDescription): OpenAPIV3_1.Document =>
  generateRoot(
    () =>
      withRegistry(GlobalDefinitionRegistry, () => ({
        ...rest,
        components: {
          schemas:
            schemas &&
            mapValues(schemas, (schema, name) =>
              generateNode(name, { scopePath: ['spec', 'components', 'schemas'] }, () => {
                getRegistry(GlobalDefinitionRegistry).register(schema, [...currentNode.context.scopePath, name]);
                return genOpenApiSchema(name, schema);
              }),
            ),
        },
        paths: mapValues(
          groupBy(endpoints, (e) => e.path),
          (g, path) =>
            generateNode(path, {}, () =>
              mapToObj(g, (e) =>
                generateNode(e.method, { scopePath: ['spec', 'paths', path, e.method, e.method] }, () => [
                  e.method,
                  generateOperationObject(e),
                ]),
              ),
            ),
        ),
      })).result,
  );

export const writeOpenApiSpec = (path: string, description: OpenApiDescription) =>
  writeFiles({ [path]: JSON.stringify(generateOpenApiSpec(description), null, 2) });
