import { ref } from '@vue/reactivity';
import { expect, it } from 'vitest';
import { currentNode, generateNode, generateRoot, withRegistry } from './dynamicTree';
import { getRegistry, Registry } from './registry';

class TestRegistry extends Registry {
  values: string[] = [];

  override register(value: string) {
    this.values.push(value);
    return this.values.length;
  }

  override merge(another: this) {
    this.values.push(...another.values);
  }

  override clear() {
    this.values = [];
  }

  override isEqual(another: this) {
    return (
      this.values.length === another.values.length &&
      this.values.every((value, index) => value === another.values[index])
    );
  }
}

it('inherits and overrides context when creating nested nodes', () => {
  const result = generateRoot(() =>
    generateNode('parent', { scopePath: ['parent'] }, () =>
      generateNode('child', { nameSuffix: 'Child' }, () => currentNode.context),
    ),
  );

  expect(result).toEqual({ scopePath: ['parent'], nameSuffix: 'Child' });
});

it('scopes registry access to the current generation node', () => {
  const root = generateRoot(() =>
    withRegistry(TestRegistry, () => {
      const registry = getRegistry(TestRegistry);
      registry.register('value');
      return registry.values.length;
    }),
  );

  expect(root.result).toBe(1);
  expect(root.registry.values).toEqual(['value']);
});

it('throws when the generation tree is not stable', () => {
  const counter = ref(0);

  expect(() =>
    generateRoot(() => {
      counter.value += 1;
      return counter.value;
    }),
  ).toThrow('Tree calculation is not stable');
});
