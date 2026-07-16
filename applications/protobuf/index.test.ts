import { expect, it } from 'vitest';
import { generateProtobufFilesOutput, ProtobufField } from './index.js';
import { S } from '@supschema/common-types';

it('References', async () => {
  const Nested = S.SafeInt({ title: 'Name', minimum: 1 });
  const Schema = S.Object({ a: ProtobufField(100, Nested) });

  const output = generateProtobufFilesOutput({
    'root.proto': {
      Root: S.Object({ b: ProtobufField(101, Schema) }),
    },
    'nested.proto': {
      Schema,
      OtherSchema: S.Object({ c: ProtobufField(100, Schema) }),
    },
  });

  expect(output).toEqual({
    'root.proto': `import "nested.proto";

syntax = "proto3";

message Root {

    optional Schema b = 101;
}`,
    'nested.proto': `syntax = "proto3";

message Schema {

    optional int64 a = 100 [packed=false];
}

message OtherSchema {

    optional Schema c = 100;
}`,
  });
});

it('Numeric types', async () => {
  expect(
    generateProtobufFilesOutput({
      'numeric.proto': {
        Root: S.Object({
          float32: ProtobufField(0, S.Float32()),
          float64: ProtobufField(1, S.Float64()),
          int8: ProtobufField(2, S.Int8()),
          int16: ProtobufField(3, S.Int16()),
          int32: ProtobufField(4, S.Int32()),
          int64: ProtobufField(5, S.Int64()),
          safeint: ProtobufField(6, S.SafeInt()),
          uint8: ProtobufField(7, S.UInt8()),
          uint16: ProtobufField(8, S.UInt16()),
          uint32: ProtobufField(9, S.UInt32()),
          uint64: ProtobufField(10, S.UInt64()),
        }),
      },
    }),
  ).toEqual({
    'numeric.proto': `syntax = "proto3";

message Root {

    optional float float32 = 0 [packed=false];
    optional double float64 = 1 [packed=false];
    optional int32 int8 = 2 [packed=false];
    optional int32 int16 = 3 [packed=false];
    optional int32 int32 = 4 [packed=false];
    optional int64 int64 = 5 [packed=false];
    optional int64 safeint = 6 [packed=false];
    optional uint32 uint8 = 7 [packed=false];
    optional uint32 uint16 = 8 [packed=false];
    optional uint32 uint32 = 9 [packed=false];
    optional uint64 uint64 = 10 [packed=false];
}`,
  });
});

it('Array', async () => {
  expect(
    generateProtobufFilesOutput({
      'array.proto': {
        Root: S.Object({
          array: ProtobufField(0, S.Array(S.String())),
          twoDimensions: ProtobufField(1, S.Array(S.Array(S.String()))),
          threeDimensions: ProtobufField(2, S.Array(S.Array(S.Array(S.String())))),
        }),
      },
    }),
  ).toEqual({
    'array.proto': `syntax = "proto3";

message Root {

    repeated string array = 0;
    repeated TwoDimensionsItem two_dimensions = 1;
    repeated ThreeDimensionsItem three_dimensions = 2;

    message TwoDimensionsItem {

        repeated string item = 0;
    }

    message ThreeDimensionsItem {

        repeated Item item = 0;

        message Item {

            repeated string item = 0;
        }
    }
}`,
  });
});

it('Tuple', async () => {
  expect(
    generateProtobufFilesOutput({
      'tuple.proto': {
        Root: S.Object({
          example: ProtobufField(0, S.Tuple([S.Boolean(), S.String(), S.Null()])),
        }),
      },
    }),
  ).toEqual({
    'tuple.proto': `import "google/protobuf";

syntax = "proto3";

message Root {

    optional Example example = 0;

    message Example {

        optional bool item0 = 0 [packed=false];
        optional string item1 = 1;
        optional NullValue item2 = 2;
    }
}`,
  });
});

it('Union', async () => {
  expect(
    generateProtobufFilesOutput({
      'union.proto': {
        Root: S.Object({
          example: ProtobufField(0, S.Union([S.Boolean(), S.String()])),
        }),
      },
    }),
  ).toEqual({
    'union.proto': `syntax = "proto3";

message Root {

    optional Example example = 0;

    message Example {

        oneof union {

            bool option0 = 0 [packed=false];
            string option1 = 1;
        }
    }
}`,
  });
});

it('Nullable', async () => {
  expect(
    generateProtobufFilesOutput({
      'nullable.proto': {
        Root: S.Object({
          example: ProtobufField(0, S.Nullable(S.String())),
        }),
      },
    }),
  ).toEqual({
    'nullable.proto': `import "google/protobuf";

syntax = "proto3";

message Root {

    optional Example example = 0;

    message Example {

        oneof union {

            NullValue option0 = 0;
            string option1 = 1;
        }
    }
}`,
  });
});

it('Record', async () => {
  expect(
    generateProtobufFilesOutput({
      'record.proto': {
        Root: S.Object({
          example: ProtobufField(0, S.Record(S.String(), S.Object({ a: ProtobufField(0, S.Boolean()) }))),
        }),
      },
    }),
  ).toEqual({
    'record.proto': `syntax = "proto3";

message Root {

    map<string, ExampleValue> example = 0;

    message ExampleValue {

        optional bool a = 0 [packed=false];
    }
}`,
  });
});

it('Enum', async () => {
  expect(
    generateProtobufFilesOutput({
      'enum.proto': {
        RootEnum: S.Enum({ a: {}, b: {} }),
        Root: S.Object({
          example: ProtobufField(0, S.Enum({ c: {}, d: {} })),
        }),
      },
    }),
  ).toEqual({
    'enum.proto': `syntax = "proto3";

enum RootEnum {

    a = 0;
    b = 1;
}

message Root {

    optional Example example = 0;

    enum Example {

        c = 0;
        d = 1;
    }
}`,
  });
});
