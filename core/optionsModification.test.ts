import { expect, it } from 'vitest';
import { extractOptionsModification, modifyOpts } from './optionsModification.js';
import { Schema } from './Schema.js';

it('returns a new schema with merged options and preserves prototype', () => {
  const base = Schema({ foo: 'bar' });
  const modified = modifyOpts(base, { baz: 123 });

  expect(modified).toEqual({ foo: 'bar', baz: 123 });
  expect(modified).not.toBe(base);
  expect(Object.getPrototypeOf(modified)).toBe(Object.getPrototypeOf(base));
  expect(modified).toBeInstanceOf(Schema);
});

it('stores modification metadata on a non-enumerable property', () => {
  const base = Schema({ alpha: true });
  const modified = modifyOpts(base, { beta: false });

  expect(modified).toEqual({ alpha: true, beta: false });
  expect(Object.getOwnPropertyDescriptor(modified, '$modification')).toMatchObject({ enumerable: false });
});

it('extracts original schema and option diff', () => {
  const base = Schema({ a: 1 });
  const modified = modifyOpts(base, { b: 2 });
  const metadata = extractOptionsModification(modified);

  expect(metadata).toBeDefined();
  expect(metadata?.originalSchema).toBe(base);
  expect(metadata?.options).toEqual({ b: 2 });
});

it('returns undefined when schema has no modification metadata', () => {
  const schema = Schema({ c: 3 });

  expect(extractOptionsModification(schema)).toBeUndefined();
});
