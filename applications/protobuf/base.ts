import { computed } from '@vue/reactivity';
import { Schema } from '@supschema/core';
import { capitalize, mapValues } from 'remeda';
import { getRegistry } from '@supschema/codegen-utils/astGeneration/registry.js';
import { Root, INamespace, IField, AnyNestedObject } from 'protobufjs';
import generateProtobufByCli from 'protobufjs-cli/targets/proto';
import {
  currentNode,
  generateNode,
  generateRoot,
  withRegistry,
} from '@supschema/codegen-utils/astGeneration/dynamicTree.js';
import {
  AstFieldGenerator,
  GlobalDefinitionRegistry,
  ImportRegistry,
  LocalDefinitionRegistry,
} from '@supschema/codegen-utils/astGeneration/common.js';
import { writeFiles } from '@supschema/codegen-utils/fs.js';

export interface ProtobufExtension<T extends boolean = true> {
  $protobuf: T extends true ? AstFieldGenerator<Omit<IField, 'id'>, this> : undefined;
}
export interface ProtobufExtended {
  $protobuf: AstFieldGenerator<Omit<IField, 'id'>>;
}

export interface IRootNamespace extends INamespace {
  imports: string[];
}

export const registerImport = (path: string) => getRegistry(ImportRegistry).register(path);

export const genProtobufField = (key: string, schema: Schema & ProtobufExtended): Omit<IField, 'id'> =>
  generateNode(key, { nameSuffix: currentNode.context.nameSuffix + capitalize(key) }, () => {
    const base = getRegistry(GlobalDefinitionRegistry).getBaseRef(schema);
    const baseRef = base && {
      schema: base.baseSchema,
      get ref() {
        const [file, ...namespaces] = base.path;
        if (file !== currentNode.context.scopePath[0]) registerImport(file);
        return namespaces.join('.');
      },
    };

    return schema.$protobuf(baseRef);
  });

export const catchDefinitions = <T>(fn: () => T) => {
  const { result, registry } = withRegistry(LocalDefinitionRegistry, fn);
  return {
    result,
    definitions: mapValues(Object.fromEntries(registry.definitions.entries()), (d) => d[1] as AnyNestedObject),
  };
};

export const define = (namePostfix: string, fn: (name: string) => AnyNestedObject): string => {
  const c = currentNode;
  const { definitions } = getRegistry(LocalDefinitionRegistry);
  const name = computed(() => {
    const baseName = c.context.nameSuffix + capitalize(namePostfix);
    let name = baseName;
    let i = 1;
    while (definitions.get(name) && definitions.get(name)?.[0] !== c) {
      name = baseName + i++;
    }

    return name;
  }).value;

  const definition = generateNode(name, { scopePath: [...currentNode.context.scopePath, name], nameSuffix: '' }, () =>
    fn(name),
  );
  getRegistry(LocalDefinitionRegistry).register(name, currentNode, definition);
  return name;
};

export const generateProtobufJson = (schemas: Record<string, ProtobufExtended>): IRootNamespace => {
  const {
    registry: { imports },
    result: nested,
  } = withRegistry(ImportRegistry, () => {
    const { definitions } = catchDefinitions(() => {
      for (const [name, schema] of Object.entries(schemas)) {
        genProtobufField(name, schema);
        getRegistry(GlobalDefinitionRegistry).register(schema, [...currentNode.context.scopePath, name]);
      }
    });

    return definitions;
  });

  return {
    nested,
    imports: [...imports],
  };
};

export const generateProtobufJsons = (files: Record<string, Record<string, ProtobufExtended>>) =>
  generateRoot(
    () =>
      withRegistry(GlobalDefinitionRegistry, () =>
        mapValues(files, (root, path) => generateNode(path, { scopePath: [path] }, () => generateProtobufJson(root))),
      ).result,
  );

export const generateProtobufByJson = (json: IRootNamespace) => {
  let output = '';
  const root = new Root();
  if (json.options) root.setOptions(json.options);
  if (json.nested) root.addJSON(json.nested);
  (root as unknown as { _needsRecursiveResolve: boolean })._needsRecursiveResolve = false;

  generateProtobufByCli(root, { syntax: 'proto3' }, (error, res) => {
    if (error) throw error;
    output = res;
  });

  if (json.imports.length) {
    output = json.imports.map((f) => `import "${f}";`).join('\n') + '\n\n' + output;
  }

  return output;
};

export const generateProtobufFilesOutput = (files: Record<string, Record<string, ProtobufExtended>>) =>
  mapValues(generateProtobufJsons(files), generateProtobufByJson);

export const writeProtobufFiles = (files: Record<string, Record<string, ProtobufExtended>>) =>
  writeFiles(generateProtobufFilesOutput(files));
