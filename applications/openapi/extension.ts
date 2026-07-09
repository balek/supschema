import { Schema } from '@supschema/core';
import type { OpenAPIV3_1 } from '@hey-api/spec-types';
import { JsonSchemaExtension } from '@supschema/json-schema/extension.js';
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

export interface OpenApiExtension<T extends boolean = true> {
  $openApi: T extends true ? AstFieldGenerator<OpenAPIV3_1.SchemaObject> : undefined;
}

export type OpenApiOrJsonSchemaExtension = OpenApiExtension | JsonSchemaExtension;

export const isOpenApiSchema = (schema: Schema): schema is OpenApiOrJsonSchemaExtension =>
  !!(schema as OpenApiExtension<boolean>).$openApi || !!(schema as JsonSchemaExtension<boolean>).$jsonSchema;

export const genOpenApiSchema = (key: string, schema: OpenApiOrJsonSchemaExtension): OpenAPIV3_1.SchemaObject =>
  generateNode(key, { nameSuffix: key }, () => {
    const base = getRegistry(GlobalDefinitionRegistry).getBaseRef(schema);
    const baseRef = base && {
      schema: base.baseSchema,
      get ref() {
        return '#/' + base.path.slice(1).join('/');
      },
    };

    if (baseRef?.schema === schema) return { $ref: baseRef.ref };

    const method = (schema as OpenApiExtension<boolean>).$openApi ?? (schema as JsonSchemaExtension).$jsonSchema;

    return omitBy(method(baseRef), (v) => v === undefined) as never;
  });

export type JsonSchemaRoot = {
  $defs?: Record<string, Schema & JsonSchemaExtension>;
  schema: Schema & JsonSchemaExtension;
};

export const generateOperationObject = (endpoint: HttpEndpoint): OpenAPIV3_1.OperationObject => ({
  parameters: Object.entries(endpoint.parameters).map(([key, schema]) => ({
    name: extractHttpParam(schema)?.name ?? key,
    in: extractHttpParam(schema)?.type ?? 'query',
    schema: genOpenApiSchema(key, schema),
  })),
  responses: mapValues(endpoint.responses, (p, key) => ({ schema: genOpenApiSchema(key, p) })),
});

export interface OpenApiDescription extends Omit<OpenAPIV3_1.Document, 'components'> {
  endpoints: HttpEndpoint[];
  schemas: Record<string, Schema & OpenApiOrJsonSchemaExtension>;
}

export const generateOpenApiSpec = ({ endpoints, schemas, ...rest }: OpenApiDescription): OpenAPIV3_1.Document =>
  generateRoot(
    () =>
      withRegistry(GlobalDefinitionRegistry, () => ({
        ...rest,
        components: {
          schemas: mapValues(schemas, (schema, name) =>
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
