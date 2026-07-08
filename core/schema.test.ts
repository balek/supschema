import { expect, it } from 'vitest';
import { createType, extend, getSchemaType, Schema } from './Schema';

const fakeImportMeta = (url: string) => ({ url }) as ImportMeta;

it('creates Schema type and returns a schema object', () => {
  const schema = Schema({ foo: 'bar' });

  expect(schema).toEqual({ foo: 'bar' });
  expect(schema).toBeInstanceOf(Schema);
  expect(getSchemaType(schema)).toBe(Schema);
  expect(Schema.getConstructorArgs({ foo: 'bar' })).toEqual([{ foo: 'bar' }]);
  expect(Schema.getConstructorArgs({})).toEqual([]);
});

it('creates a named type from importMeta.url and preserves inheritance', () => {
  const Parent = createType(fakeImportMeta('file:///root/Parent.ts'), Schema);
  const Child = createType(fakeImportMeta('file:///root/child/index.ts'), Parent);

  expect(Parent.name).toBe('Parent');
  expect(Child.name).toBe('child');
  expect(Parent.importMeta.url).toBe('file:///root/Parent.ts');

  const instance = Child({});
  expect(instance).toBeInstanceOf(Child);
  expect(instance).toBeInstanceOf(Parent);
  expect(instance).toBeInstanceOf(Schema);
  expect(getSchemaType(instance)).toBe(Child);
});

it('supports custom constructor functions and getConstructorArgs', () => {
  const Custom = createType(
    fakeImportMeta('file:///custom/Custom.ts'),
    Schema,
    (value: number, opts?: { label?: string }) => ({ value, ...opts }),
    ({ value, label }) => [value, label ? { label } : undefined] as const,
  );

  const instance = Custom(42, { label: 'answer' });
  expect(instance).toEqual({ value: 42, label: 'answer' });
  expect(Custom.getConstructorArgs(instance)).toEqual([42, { label: 'answer' }]);
});

it('extends prototype with memoized getters by default', () => {
  let calls = 0;
  const Type = createType<{ $computed: number }>(fakeImportMeta('file:///memo/Type.ts'), Schema);

  extend(Type, {
    get $computed() {
      calls += 1;
      return 3.14;
    },
  });

  const instance = Type({});
  expect(instance.$computed).toBe(3.14);
  expect(instance.$computed).toBe(3.14);
  expect(calls).toBe(1);
  expect(Object.getOwnPropertyDescriptor(instance, '$computed')).toMatchObject({ value: 3.14 });
});

it('can disable getter memoization when requested', () => {
  let calls = 0;
  const Type = createType<{ $computed: number }>(fakeImportMeta('file:///nomemo/Type.ts'), Schema);

  extend(
    Type,
    {
      get $computed() {
        calls += 1;
        return 7;
      },
    },
    { memoGetters: false },
  );

  const instance = Type({});
  expect(instance.$computed).toBe(7);
  expect(instance.$computed).toBe(7);
  expect(calls).toBe(2);
});
