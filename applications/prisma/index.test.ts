import { expect, it } from 'vitest';
import { DatabaseConnector, generatePrismaSchemas, RootSchemas } from './index.js';
import { S } from '@supschema/common-types';
import { Model, ModelRelation, Unique } from '@supschema/model-types';
import { validate } from '@prisma/internals';

it('generates root schema.prisma', () => {
  expect(
    generatePrismaSchemas(
      {
        datasource: { provider: 'postgresql' },
        generators: {},
      },
      {},
    ),
  ).toEqual({
    'schema.prisma': `
datasource db {
  provider = "postgresql"
}
`,
  });
});

const generateTest = (connector: DatabaseConnector, schemas: Record<string, RootSchemas>) => {
  const res = generatePrismaSchemas(
    {
      datasource: { provider: connector },
      generators: {},
    },
    {
      'test.prisma': schemas,
    },
  );
  validate({ schemas: Object.entries(res) });
  return res['test.prisma'];
};
const generatePostgresTest = (schemas: Record<string, RootSchemas>) => generateTest('postgresql', schemas);
const generateMongoTest = (schemas: Record<string, RootSchemas>) => generateTest('mongodb', schemas);

it('generates descriptions and comments', () => {
  const TestEnum = S.Enum(
    { a: { title: 'Enum value title', description: 'Enum value description' } },
    { title: 'Enum title', description: 'Enum description' },
  );
  const TestType = Model(
    { name: 'TestType', key: ['test1'], title: 'Object title', description: 'Object description' },
    {
      test1: S.String({ title: 'Property title', description: 'Property description' }),
      test2: TestEnum,
    },
  );

  expect(generatePostgresTest({ TestEnum, TestType })).toEqual(`/// Enum title
/// Enum description

enum TestEnum {
  /// Enum value description
  a /// Enum value title
}
/// Object title
/// Object description

model TestType {
  /// Property description
  test1 String   @id /// Property title
  test2 TestEnum
}
`);
});

it('Scalars', () => {
  expect(
    generatePostgresTest({
      Test: Model(
        { name: 'Test', key: ['string'] },
        {
          boolean: S.Boolean(),
          string: S.String(),
          bytes: S.Bytes(),
          float32: S.Float32(),
          float64: S.Float64(),
          int8: S.Int8(),
          int16: S.Int16(),
          int32: S.Int32(),
          int64: S.Int64(),
          safeint: S.SafeInt(),
          uint8: S.UInt8(),
          uint16: S.UInt16(),
          uint32: S.UInt32(),
          uint64: S.UInt64(),
        },
      ),
    }),
  ).toEqual(`
model Test {
  boolean Boolean
  string  String  @id
  bytes   Bytes
  float32 Float   @db.Real
  float64 Float
  int8    Int     @db.SmallInt
  int16   Int     @db.SmallInt
  int32   Int
  int64   BigInt
  safeint BigInt
  uint8   Int     @db.SmallInt
  uint16  Int
  uint32  BigInt
  uint64  String
}
`);
});

it('Array', () => {
  expect(generateMongoTest({ Schema: S.Object({ example: S.Array(S.Boolean()) }) })).toEqual(`
type Schema {
  example Boolean[]
}
`);
});

it('Nullable', () => {
  expect(generateMongoTest({ Schema: S.Object({ example: S.Nullable(S.Boolean()) }) })).toEqual(`
type Schema {
  example Boolean?
}
`);
});

it('models', () => {
  const Test = Model(
    {
      name: 'Test',
      key: ['id', 'test1'],
      indexes: [{ fields: ['test1', 'test2'] }],
      uniques: [{ fields: ['id', 'test1', 'test2'] }],
    },
    { id: S.String(), test1: Unique(S.String()), test2: S.String() },
  );

  expect(generatePostgresTest({ Test })).toEqual(`
model Test {
  id    String
  test1 String @unique
  test2 String

  @@id([id, test1])
  @@unique([id, test1, test2])
  @@index([test1, test2])
}
`);
});

it('relations', () => {
  const Test1 = Model({ name: 'Test1', key: ['id'] }, { id: S.String(), nullableId: S.Nullable(S.String()) });
  const Test2 = Model({ name: 'Test2', key: ['id'] }, { id: S.String(), arrayId: Unique(S.String()) });

  expect(
    generatePostgresTest({
      Test1,
      Test2,
      RelOneToOne: ModelRelation(Test1, 'oneToOne', ['id'], Test2, 'oneToOneRev', ['id']),
      RelNullable: ModelRelation(Test1, 'nullable', ['nullableId'], Test2, 'nullableRev', ['id']),
      RelArray: ModelRelation(Test2, 'array', ['arrayId'], Test1, 'arrayRev', ['id']),
    }),
  ).toEqual(`
model Test1 {
  id         String  @id
  nullableId String?
  oneToOne   Test2   @relation("oneToOne", fields: [id], references: [id])
  nullable   Test2?  @relation("nullable", fields: [nullableId], references: [id])
  arrayRev   Test2[] @relation("array")
}

model Test2 {
  id          String  @id
  arrayId     String  @unique
  array       Test1   @relation("array", fields: [arrayId], references: [id])
  oneToOneRev Test1?  @relation("oneToOne")
  nullableRev Test1[] @relation("nullable")
}
`);
});
