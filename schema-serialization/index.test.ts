import { it, expect } from 'vitest';
import { Schema } from '@supschema/core';
import { deserializeSchemaValue, serializeSchema } from './index.js';
import { testPathGetter } from '@supschema/core/testUtils.js';

it('serializes primitive schema', () => {
  const schema = Schema();

  expect(serializeSchema(schema)).toEqual(['___SCHEMA___', 'supschema/core/Schema']);
});

it('serializes and deserializes a schema with nested schema values', async () => {
  const schema = Schema({ foo: 'bar', nested: [Schema({ value: 'x' })] });
  const serialized = serializeSchema(schema, testPathGetter);
  const deserialized = await deserializeSchemaValue(serialized);

  expect(deserialized).toEqual(schema);
});
