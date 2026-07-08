import { computed, shallowReactive } from '@vue/reactivity';
import { Registry } from './registry';
import { currentNode, GenerationNode } from './dynamicTree';
import { extractOptionsModification, Schema } from '@supschema/core';
import { isDeepEqual } from 'remeda';

export interface SchemaDefinitionRef {
  schema: Schema;
  ref: string;
}

export type AstFieldGenerator<T> = (baseRef?: SchemaDefinitionRef) => T;

export class ImportRegistry extends Registry {
  imports = shallowReactive(new Set<string>());

  override register(path: string) {
    this.imports.add(path);
  }

  override merge(another: this) {
    for (const path of another.imports) {
      this.imports.add(path);
    }
  }

  override clear(): void {
    this.imports.clear();
  }

  override isEqual(another: this) {
    return isDeepEqual(this.imports, another.imports);
  }
}

export class LocalDefinitionRegistry extends Registry {
  definitions: Map<string, [GenerationNode, unknown]> = shallowReactive(new Map());

  override register(name: string, context: GenerationNode, definition: unknown) {
    this.definitions.set(name, [context, definition]);
  }

  override merge(another: this) {
    for (const [key, path] of another.definitions) {
      this.definitions.set(key, path);
    }
  }

  override clear(): void {
    this.definitions.clear();
  }

  override isEqual(another: this) {
    return isDeepEqual(this.definitions, another.definitions);
  }
}

export class GlobalDefinitionRegistry extends Registry {
  schemas: Map<Schema, string[]> = shallowReactive(new Map());

  override register(schema: Schema, path: string[]) {
    this.schemas.set(schema, path);
  }

  override merge(another: this) {
    for (const [schema, path] of another.schemas) {
      this.schemas.set(schema, path);
    }
  }

  override clear(): void {
    this.schemas.clear();
  }

  override isEqual(another: this) {
    return isDeepEqual(this.schemas, another.schemas);
  }

  getBaseRef(schema: Schema) {
    const { schemas } = this;
    const { scopePath, nameSuffix } = currentNode.context;
    const baseSchema = computed(() => {
      let s: Schema | undefined = schema;
      while (s) {
        const ref = schemas.get(s);
        if (ref && !isDeepEqual(ref, [...scopePath, nameSuffix])) return s;

        s = extractOptionsModification(s)?.originalSchema;
      }
    }).value;

    const path = baseSchema && schemas.get(baseSchema);

    return baseSchema && path ? { baseSchema, path } : undefined;
  }
}
