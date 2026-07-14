import type { JSONSchemaDraft2020_12 } from '@hey-api/spec-types';
import { AstFieldGenerator, GlobalDefinitionRegistry } from '@supschema/codegen-utils/astGeneration/common.js';
import {
  currentNode,
  generateNode,
  generateRoot,
  withRegistry,
} from '@supschema/codegen-utils/astGeneration/dynamicTree.js';
import { getRegistry } from '@supschema/codegen-utils/astGeneration/registry.js';
import { writeFiles } from '@supschema/codegen-utils/fs.js';
import { Schema } from '@supschema/core';
import { mapValues, omitBy } from 'remeda';

export interface JsonSchemaExtension<T extends boolean = true> {
  $jsonSchema: T extends true ? AstFieldGenerator<JSONSchemaDraft2020_12.Document, this> : undefined;
}
export type JsonSchemaExtended = { $jsonSchema: AstFieldGenerator<JSONSchemaDraft2020_12.Document> };

export const genJsonSchema = (key: string, schema: Schema & JsonSchemaExtended): JSONSchemaDraft2020_12.Document =>
  generateNode(key, { nameSuffix: key }, () => {
    const base = getRegistry(GlobalDefinitionRegistry).getBaseRef(schema);
    const baseRef = base && {
      schema: base.baseSchema,
      get ref() {
        const [file, ...namespaces] = base.path;
        const ref = '#/' + namespaces.join('/');
        return file !== currentNode.context.scopePath[0] ? file + ref : ref;
      },
    };

    if (baseRef?.schema === schema) return { $ref: baseRef.ref };

    return omitBy(schema.$jsonSchema(baseRef), (v) => v === undefined);
  });

export type JsonSchemaRoot = {
  $defs?: Record<string, Schema & JsonSchemaExtended>;
  schema: Schema & JsonSchemaExtended;
};

export const generateJsonSchemaRoot = (root: JsonSchemaRoot): JSONSchemaDraft2020_12.Document => ({
  ...(root.$defs && {
    $defs: mapValues(root.$defs, (s, key) =>
      generateNode(key, { scopePath: [...currentNode.context.scopePath, '$defs'] }, () => {
        getRegistry(GlobalDefinitionRegistry).register(s, [...currentNode.context.scopePath, key]);
        return genJsonSchema(key, s);
      }),
    ),
  }),
  ...genJsonSchema('', root.schema),
});

export const generateJsonSchemas = (files: Record<string, JsonSchemaRoot>) =>
  generateRoot(
    () =>
      withRegistry(GlobalDefinitionRegistry, () =>
        mapValues(files, (root, path) => generateNode(path, { scopePath: [path] }, () => generateJsonSchemaRoot(root))),
      ).result,
  );

export const writeJsonSchemas = (files: Record<string, JsonSchemaRoot>) =>
  writeFiles(mapValues(generateJsonSchemas(files), (s) => JSON.stringify(s, null, 2)));
