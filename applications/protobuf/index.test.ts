import { expect, it } from 'vitest';
import { generateProtobufFilesOutput } from './index.js';
import { S } from '@supschema/common-types';

it('References', async () => {
  const Nested = S.SafeInt({ title: 'Name', minimum: 1 });
  const Schema = S.Object({ a: Nested });

  const output = generateProtobufFilesOutput({
    'root.proto': {
      Root: S.Object({ b: Schema }),
    },
    'nested.proto': {
      Schema,
      OtherSchema: S.Object({ c: Schema }),
    },
  });

  expect(output).toEqual({
    'root.proto': `import "nested.proto";

syntax = "proto3";

message Root {

    optional Schema b = 0;
}`,
    'nested.proto': `syntax = "proto3";

message Schema {

    optional int64 a = 0 [packed=false];
}

message OtherSchema {

    optional Schema c = 0;
}`,
  });
});

it('Numeric types', async () => {
  expect(
    generateProtobufFilesOutput({
      'numeric.proto': {
        Root: S.Object({
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
          array: S.Array(S.String()),
          twoDimensions: S.Array(S.Array(S.String())),
          threeDimensions: S.Array(S.Array(S.Array(S.String()))),
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
          example: S.Tuple([S.Boolean(), S.String(), S.Null()]),
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
          example: S.Union([S.Boolean(), S.String()]),
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
          example: S.Nullable(S.String()),
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
          example: S.Record(S.String(), S.Object({ a: S.Boolean() })),
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
          example: S.Enum({ c: {}, d: {} }),
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
