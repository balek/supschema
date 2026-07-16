# SupSchema

Single source of truth for all types of metadata: storage, transport, validation, documentation, and beyond. Implementation of [Super Schema Architecture](https://dev.to/balekhov/super-schema-architecture-5155).

## Basic usage

Install common schema types and schema applications you want to use.

```bash
npm install @supschema/common-types @supschema/model-types @supschema/openapi @supschema/prisma @supschema/zod
```

Describe your data and generate specifications/code/documentation or use the description directly in JS runtime for validation/encoding/display/etc.

```typescript
import { S } from '@supschema/common-types';
import { Model, AutoIncrement } from '@supschema/model-types';
import { HttpEndpoint, writeOpenApiSpec } from '@supschema/openapi';
import { writePrismaSchemas } from '@supschema/prisma';
import '@supschema/zod';

const User = Model({ name: 'User', key: ['id'] }, { id: AutoIncrement(S.Int32()), name: S.String({ minLength: 1 }) });
const UserCreateData = S.Omit(User, ['id']);

const UserCreateEndpoint = HttpEndpoint('/users', 'post', { body: UserCreateData }, S.Object({ id: S.Integer() }));

// Generate ORM schema files
await writePrismaSchemas(
  'prisma',
  { datasource: { provider: 'postgresql' }, generators: {} },
  { 'schema.prisma': { User } },
);

// Generate OpenAPI spec file
await writeOpenApiSpec('openapi.yml', {
  openapi: '3.1.2',
  info: { title: 'Test', version: '1.0.0' },
  endpoints: [UserCreateEndpoint],
});

// Make runtime validations
UserCreateData.$zod.safeParse({ name: '' });
```

## Concepts

SupSchema is designed to be modular and unopinionated. The project provides a small core plus common schema types and applications, but you can override or extend anything. You can also build your own type system from scratch using only the core package.

### Schema type

The central concept in SupSchema is the schema type. A type is a schema constructor that accepts options for the schema it creates. The type determines possible usages of the resulting schema. For example, some schemas are suitable for OpenAPI generation while others are not. Types can inherit from a parent type and keep some applications while overriding others. For example, Int32 inherits from SafeInt and reuses the base OpenAPI behavior while overriding the protobuf representation.

You can create a new type for your needs:

```typescript
import { createType, Schema } from '@supschema/core';

export interface Uuid extends Schema {
  version?: 4 | 7;
}

export const Uuid = createType<Uuid>(import.meta, Schema);
export default Uuid;
```

Any type must have a parent type. `Schema` is the root type. By default, a new type constructor accepts an optional object of schema options, such as `Uuid({ version: 4 })`. You can also define a custom constructor in `createType`:

```typescript
export const Uuid = createType<Uuid>(
  import.meta,
  Schema,
  (version: Uuid['version'], opts?: Omit<SchemaOptions<Uuid>, 'version'>) => ({ version, opts }),
  ({ version, ...opts }) => [version, opts] as const,
);
```

The third argument is a custom constructor function. If it is provided, the fourth argument is required and restores the constructor arguments from the schema options.

### Schema applications

Once a type exists, it can be extended with methods in the same file or elsewhere in the codebase:

```typescript
import { extend } from '@supschema/core';
import Uuid from './path/to/Uuid.js';

declare module './path/to/Uuid.js' {
  interface Uuid {
    $yourMethod: () => string;
  }
}

extend(Uuid, {
  $yourMethod() {
    return crypto.randomUUID(); // Don't look for a reason for such method. This is a syntetic example to show the mechanics.
  },
});
```

The `declare module` block tells TypeScript that `Uuid` schemas have this new method, and `extend` provides the implementation. The method is then available on all schema instances:

```typescript
const UuidSchema = Uuid();
const exampleValue = UuidSchema.$yourMethod();
```

The same mechanism can be used to support new types in built-in schema applications. For example, a type can expose OpenAPI metadata like this:

```typescript
import { extend } from '@supschema/core';
import { OpenApiExtension } from '@supschema/openapi';
import { callSuper } from '@supschema/core/utils.js';
import Uuid from './path/to/Uuid.js';

declare module './path/to/Uuid.js' {
  interface Uuid extends OpenApiExtension {}
}

extend(Uuid, {
  $openApi() {
    return {
      ...callSuper(this, '$openApi', Uuid),
      type: 'string',
      format: 'uuid',
    };
  },
});
```

### Schema modification

You can create a schema from another schema while overriding some options:

```typescript
const CommentedSchema = modifyOpts(SomeSchema, { description: 'Some comment differing from the base schema' });
```

SupSchema keeps track of the relationship between `CommentedSchema` and `SomeSchema`. That information can be extracted with `extractOptionsModification(CommentedSchema)` and used by schema applications.

## Current stage

The project is still in an early proof-of-concept stage. The core part is usable, but the applications are not finished yet.

## Repository layout

- `core/` – the root `Schema` type, `createType`, and `modifyOpts`
- `common-types/` – basic widely used schema types
- `applications/` – format-specific integrations such as OpenAPI, JSON Schema, and Protobuf
- `schema-serialization/` – utilities for serializing schemas
- `self-source/` – utilities for regenerating schema source code for reuse in different runtimes (codegen, server and browser)

## Contribution

Contributions, ideas, and questions are welcome.

## Acknowledgements

The project draws inspiration from:

- [TypeBox](https://sinclairzx81.github.io/typebox/)
- [TypeSpec](https://typespec.io)
