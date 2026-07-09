import { expect, it } from 'vitest';
import { createTrackingRegistry, computedWithRegistries, getRegistry, withRegistries } from './registry.js';
import { Registry } from './registry.js';
import { ref } from '@vue/reactivity';

class TestRegistry extends Registry {
  data: unknown[] = [];

  register(value: unknown) {
    this.data.push(value);
    return this.data.length;
  }

  merge(another: this) {
    this.data.push(...another.data);
  }

  clear() {
    this.data = [];
  }

  isEqual(another: this) {
    return this.data.length === another.data.length && this.data.every((value, index) => value === another.data[index]);
  }
}

class MissingRegistry extends Registry {
  register() {
    return undefined;
  }
  merge() {}
  clear() {}
  isEqual() {
    return false;
  }
}

it('getRegistry throws when the requested registry is not set', () => {
  withRegistries(new Map(), () => {
    expect(() => getRegistry(MissingRegistry)).toThrow('Registry is requested but not set');
  });
});

it('Tracking Registry records changes separately from the original registry', () => {
  const baseRegistry = new TestRegistry();
  const trackingRegistry = createTrackingRegistry(baseRegistry);

  const registerResult = trackingRegistry.register('a');

  expect(registerResult).toBe(1);
  expect(baseRegistry.data).toEqual(['a']);
  expect(trackingRegistry._changesRegistry?.data).toEqual(['a']);

  const mergeSource = new TestRegistry();
  mergeSource.register('b');
  baseRegistry.merge(mergeSource);

  expect(baseRegistry.data).toEqual(['a', 'b']);
  expect(trackingRegistry._changesRegistry?.data).toEqual(['a']);
});

it('computedWithRegistries applies tracked registry changes when the computed value is read', () => {
  const baseRegistry = new TestRegistry();
  const registries = new Map([[TestRegistry, baseRegistry]]);

  withRegistries(registries, () => {
    const testRef = ref(0);
    const resultRef = computedWithRegistries(() => {
      getRegistry(TestRegistry).register('value');
      return testRef.value;
    });

    expect(resultRef.value).toBe(0);
    testRef.value += 1;
    expect(resultRef.value).toBe(1);
  });

  expect(baseRegistry.data).toEqual(['value', 'value', 'value', 'value']);
});

it('computedWithRegistries preserves merge results across repeated reads when changes are equal', () => {
  const baseRegistry = new TestRegistry();
  const registries = new Map([[TestRegistry, baseRegistry]]);

  withRegistries(registries, () => {
    const computed = computedWithRegistries(() => {
      getRegistry(TestRegistry).register('x');
      return 'ok';
    });

    expect(computed.value).toEqual('ok');
    expect(computed.value).toEqual('ok');
  });

  expect(baseRegistry.data).toEqual(['x', 'x', 'x']);
});
