import { it, expect, describe } from 'vitest';
import { S } from './index.js';

describe('All types', () => {
  it('inherit DataValue', () => {
    expect(S.Array(S.DataValue())).toBeInstanceOf(S.DataValue);
    expect(S.Boolean()).toBeInstanceOf(S.DataValue);
    expect(S.Bytes()).toBeInstanceOf(S.DataValue);
    expect(S.Enum({})).toBeInstanceOf(S.DataValue);
    expect(S.Intersect([])).toBeInstanceOf(S.DataValue);
    expect(S.Numeric()).toBeInstanceOf(S.DataValue);
    expect(S.Null()).toBeInstanceOf(S.DataValue);
    expect(S.Nullable(S.DataValue())).toBeInstanceOf(S.DataValue);
    expect(S.Object({})).toBeInstanceOf(S.DataValue);
    expect(S.Record(S.String(), S.DataValue())).toBeInstanceOf(S.DataValue);
    expect(S.String()).toBeInstanceOf(S.DataValue);
    expect(S.Tuple([])).toBeInstanceOf(S.DataValue);
    expect(S.Union([])).toBeInstanceOf(S.DataValue);
  });
});

describe('Numeric types', () => {
  it('have correct inheritance', () => {
    expect(S.Float()).toBeInstanceOf(S.Numeric);
    expect(S.Integer()).toBeInstanceOf(S.Numeric);
    expect(S.Float()).not.toBeInstanceOf(S.Integer);
    expect(S.Integer()).not.toBeInstanceOf(S.Float);

    expect(S.Float32()).toBeInstanceOf(S.Float);
    expect(S.Float64()).toBeInstanceOf(S.Float);
    expect(S.Float32()).not.toBeInstanceOf(S.Float64);
    expect(S.Float64()).not.toBeInstanceOf(S.Float32);

    expect(S.SafeInt()).toBeInstanceOf(S.Integer);
    expect(S.Int64()).toBeInstanceOf(S.Integer);
    expect(S.UInt64()).toBeInstanceOf(S.Integer);
    expect(S.SafeInt()).not.toBeInstanceOf(S.UInt64);
    expect(S.Int64()).not.toBeInstanceOf(S.UInt64);
    expect(S.SafeInt()).not.toBeInstanceOf(S.Int64);
    expect(S.UInt64()).not.toBeInstanceOf(S.Int64);
    expect(S.Int64()).not.toBeInstanceOf(S.SafeInt);
    expect(S.UInt64()).not.toBeInstanceOf(S.SafeInt);

    expect(S.Int32()).toBeInstanceOf(S.SafeInt);
    expect(S.UInt32()).toBeInstanceOf(S.SafeInt);
    expect(S.Int16()).toBeInstanceOf(S.SafeInt);
    expect(S.UInt32()).toBeInstanceOf(S.SafeInt);
    expect(S.Int8()).toBeInstanceOf(S.SafeInt);
    expect(S.UInt8()).toBeInstanceOf(S.SafeInt);
  });
});

describe('Object operation types', () => {
  it('work correctly', () => {
    const object = S.Object({ a: S.String(), b: S.Integer() }, { title: 'Test object' });
    const keys = ['a'] as const;

    const omitted = S.Omit(object, keys);
    expect(omitted).toBeInstanceOf(S.Object);
    expect(omitted).toEqual({
      keys,
      object,
      properties: { b: object.properties.b },
    });

    const picked = S.Pick(object, keys);
    expect(picked).toBeInstanceOf(S.Object);
    expect(picked).toEqual({
      keys,
      object,
      properties: { a: object.properties.a },
    });

    const partial = S.Partial(object);
    expect(partial).toBeInstanceOf(S.Object);
    expect(partial).toEqual({
      object,
      properties: {
        a: { schema: object.properties.a },
        b: { schema: object.properties.b },
      },
    });
  });
});
