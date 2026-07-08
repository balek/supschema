import { expect, it } from 'vitest';
import { callSuper, findDescriptorInPrototypeChain, getSuper } from './utils';

it('finds both own and inherited descriptors in the prototype chain', () => {
  class Base {
    get baseValue() {
      return 'base';
    }
  }

  class Derived extends Base {
    get derivedValue() {
      return 'derived';
    }
  }

  const instance = new Derived();

  const directDescriptor = findDescriptorInPrototypeChain(instance, 'derivedValue');
  expect(directDescriptor?.get?.call(instance)).toBe('derived');

  const inheritedDescriptor = findDescriptorInPrototypeChain(instance, 'baseValue');
  expect(inheritedDescriptor?.get?.call(instance)).toBe('base');
});

it('stops searching at the provided constructor boundary', () => {
  class GrandParent {
    get value() {
      return 'grand-parent';
    }
  }

  class Parent extends GrandParent {}
  class Child extends Parent {}

  const instance = new Child();

  expect(findDescriptorInPrototypeChain(instance, 'value', Parent)).toBeUndefined();
  expect(findDescriptorInPrototypeChain(instance, 'value', Child)).toBeUndefined();
});

it('returns the ancestor value for a property', () => {
  class Base {
    get value() {
      return 'base';
    }
  }

  class Derived extends Base {
    get value() {
      return 'derived';
    }
  }

  const instance = new Derived();

  expect(getSuper(instance, 'value')).toBe('base');
});

it('calls ancestor methods with the provided arguments', () => {
  class Base {
    greet(name: string) {
      return `hello ${name}`;
    }
  }

  class Derived extends Base {
    greet(name: string): string {
      return callSuper(this, 'greet', Derived, name) ?? '';
    }
  }

  const instance = new Derived();

  expect(instance.greet('world')).toBe('hello world');
});
