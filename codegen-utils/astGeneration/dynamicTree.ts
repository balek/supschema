import { computed } from '@vue/reactivity';
import {
  computedWithRegistries,
  createTrackingRegistry,
  currentRegistries,
  Registry,
  withRegistries,
} from './registry.js';

interface Context {
  /** Path describing the current scope within the generated tree. */
  scopePath: string[];
  /** Suffix appended to names generated in the current scope. */
  nameSuffix: string;
}

/**
 * A memoized node in the generation tree.
 */
export interface GenerationNode<T = unknown> {
  context: Context;
  valueRef: { value: T };
  children: Record<string, GenerationNode>;
}

/**
 * Create the root generation node and bind it to the current scope while the callback runs.
 */
const createRootNode = <T>(fn: () => T): GenerationNode<T> => {
  const rootNode = {
    context: {
      scopePath: [],
      nameSuffix: '',
    },
    children: {},
    valueRef: computed(() => {
      currentNode = rootNode;
      return fn();
    }),
  };
  return rootNode;
};

/**
 * The currently active generation node used by the surrounding code while generating values.
 */
export let currentNode = createRootNode<unknown>(() => {});

/**
 * Get an existing generation node for the given key or create a new one with the provided context.
 */
export const generateNode = <T>(key: string, context: Partial<Context>, fn: () => T): T => {
  const existingNode = currentNode.children[key];
  if (existingNode) return existingNode.valueRef.value as T;

  const node: GenerationNode<T> = {
    context: {
      ...currentNode.context,
      ...context,
    },
    children: {},
    valueRef: computedWithRegistries(() => {
      const previousScope = currentNode;
      currentNode = node;

      const res = fn();

      currentNode = previousScope;
      return res;
    }),
  };
  currentNode.children[key] = node;

  return node.valueRef.value;
};

/**
 * Run a callback with a new registry instance scoped to the current generation node.
 */
export const withRegistry = <R extends Registry, Res>(
  registryClass: new () => R,
  fn: () => Res,
): { result: Res; registry: R } => {
  const registry = new registryClass();

  return generateNode(registryClass.name, {}, () => {
    const map = new Map(currentRegistries);
    const trackingRegistry = createTrackingRegistry(registry);
    map.set(registryClass, trackingRegistry);

    const result = withRegistries(map, fn);

    if (!trackingRegistry._changesRegistry?.isEqual(registry)) {
      registry.clear();
      if (trackingRegistry._changesRegistry) registry.merge(trackingRegistry._changesRegistry);
    }

    return { result, registry };
  });
};

/**
 * Execute the root generation callback and ensure the resulting tree is stable across repeated reads.
 */
export const generateRoot = <T>(fn: () => T) => {
  const { valueRef } = createRootNode(fn);
  let previousValue = valueRef.value;
  for (let i = 0; i < 4; i++) {
    const newValue = valueRef.value;
    if (newValue === previousValue) return newValue;
    previousValue = newValue;
  }

  throw new Error('Tree calculation is not stable');
};
