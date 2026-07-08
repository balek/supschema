import { expect, it } from 'vitest';
import { generateJsonSchemas } from '.';
import { S } from '@supschema/common-types';

it('JSON Schema with references', async () => {
  const Nested = S.SafeInt({ title: 'Name', minimum: 1 });
  const Schema = S.Object({ a: Nested });
  const output = generateJsonSchemas({
    'schema1.json': {
      $defs: { Nested },
      schema: Schema,
    },
    'schema2.json': {
      schema: S.Object({ b: Nested }),
    },
  });

  expect(output).toEqual({
    'schema1.json': {
      $defs: {
        Nested: {
          title: 'Name',
          minimum: 1,
          type: 'integer',
        },
      },
      type: 'object',
      properties: {
        a: {
          $ref: '#/$defs/Nested',
        },
      },
      required: ['a'],
    },
    'schema2.json': {
      type: 'object',
      properties: {
        b: {
          $ref: 'schema1.json#/$defs/Nested',
        },
      },
      required: ['b'],
    },
  });
});

it('Scalar types', async () => {
  expect(
    generateJsonSchemas({
      'float.json': { schema: S.Float() },
      'float32.json': { schema: S.Float32() },
      'float64.json': { schema: S.Float64() },
      'int8.json': { schema: S.Int8() },
      'int16.json': { schema: S.Int16() },
      'int32.json': { schema: S.Int32() },
      'safeint.json': { schema: S.SafeInt() },
      'uint8.json': { schema: S.UInt8() },
      'uint16.json': { schema: S.UInt16() },
      'uint32.json': { schema: S.UInt32() },
      'boolean.json': { schema: S.Boolean() },
      'null.json': { schema: S.Null() },
      'string.json': { schema: S.String() },
    }),
  ).toEqual({
    'float.json': { type: 'number' },
    'float32.json': { type: 'number' },
    'float64.json': { type: 'number' },
    'int8.json': { type: 'integer' },
    'int16.json': { type: 'integer' },
    'int32.json': { type: 'integer' },
    'safeint.json': { type: 'integer' },
    'uint8.json': { type: 'integer' },
    'uint16.json': { type: 'integer' },
    'uint32.json': { type: 'integer' },
    'boolean.json': { type: 'boolean' },
    'null.json': { type: 'null' },
    'string.json': { type: 'string' },
  });
});

it('Array', async () => {
  expect(
    generateJsonSchemas({
      'array.json': { schema: S.Array(S.String()) },
      'twoDimensions.json': { schema: S.Array(S.Array(S.String())) },
      'threeDimensions.json': { schema: S.Array(S.Array(S.Array(S.String()))) },
    }),
  ).toEqual({
    'array.json': { type: 'array', items: { type: 'string' } },
    'twoDimensions.json': { type: 'array', items: { type: 'array', items: { type: 'string' } } },
    'threeDimensions.json': {
      type: 'array',
      items: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
    },
  });
});

it('Tuple', async () => {
  expect(
    generateJsonSchemas({
      'tuple.json': {
        schema: S.Tuple([S.Boolean(), S.String(), S.Null()]),
      },
    }),
  ).toEqual({
    'tuple.json': {
      type: 'array',
      prefixItems: [{ type: 'boolean' }, { type: 'string' }, { type: 'null' }],
      items: false,
    },
  });
});

it('Union', async () => {
  expect(
    generateJsonSchemas({
      'union.json': {
        schema: S.Union([S.Boolean(), S.String()]),
      },
    }),
  ).toEqual({
    'union.json': {
      anyOf: [{ type: 'boolean' }, { type: 'string' }],
    },
  });
});

it('Nullable', async () => {
  expect(
    generateJsonSchemas({
      'nullable.json': {
        schema: S.Nullable(S.String()),
      },
    }),
  ).toEqual({
    'nullable.json': {
      type: ['null', 'string'],
    },
  });
});

it('Record', async () => {
  expect(
    generateJsonSchemas({
      'record.json': {
        schema: S.Record(S.String(), S.Object({ a: S.Boolean() })),
      },
    }),
  ).toEqual({
    'record.json': {
      type: 'object',
      propertyNames: { type: 'string' },
      additionalProperties: {
        type: 'object',
        properties: {
          a: { type: 'boolean' },
        },
        required: ['a'],
      },
    },
  });
});

it('Enum', async () => {
  expect(
    generateJsonSchemas({
      'enum.json': {
        schema: S.Enum({ a: {}, b: {} }),
      },
    }),
  ).toEqual({
    'enum.json': { type: 'string', enum: ['a', 'b'] },
  });
});

it('Optional', async () => {
  expect(
    generateJsonSchemas({
      'optional.json': {
        schema: S.Object({ a: S.String(), b: S.Optional(S.String()) }),
      },
    }),
  ).toEqual({
    'optional.json': { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } }, required: ['a'] },
  });
});
