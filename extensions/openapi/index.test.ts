import { expect, it } from 'vitest';
import { generateOpenApiSpec } from '.';
import { S } from '@supschema/common-types';
import HttpEndpoint from './HttpEndpoint';

it('Simple spec', async () => {
  const User = S.Object({ name: S.String() });
  const output = generateOpenApiSpec({
    openapi: '3.1.2',
    info: { title: 'Test', version: '0.0.0' },
    endpoints: [HttpEndpoint('/users', 'get', { limit: S.Int16() }, { 200: S.Object({ items: S.Array(User) }) })],
    schemas: { User },
  });

  expect(output).toEqual({
    openapi: '3.1.2',
    info: { title: 'Test', version: '0.0.0' },
    components: { schemas: { User: { type: 'object', required: ['name'], properties: { name: { type: 'string' } } } } },
    paths: {
      '/users': {
        get: {
          parameters: [
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer' },
            },
          ],
          responses: {
            200: {
              schema: {
                type: 'object',
                required: ['items'],
                properties: { items: { type: 'array', items: { $ref: '#/components/schemas/User' } } },
              },
            },
          },
        },
      },
    },
  });
});
