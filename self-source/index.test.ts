import { it, expect } from 'vitest';
import { generateSelfSourceFilesOutput } from './index.js';
import { modifyOpts, Schema, SchemaPathGetter } from '@supschema/core';

const basePath = new URL('..', import.meta.url).href;
const pathGetter: SchemaPathGetter = (m) =>
  m.url
    .replace(basePath, '@supschema/')
    .replace(/\.ts$/, '')
    .replace(/\/index$/, '');

it('basic schema', () => {
  const path = 'test/test.ts';
  const output = generateSelfSourceFilesOutput({ [path]: { Basic: Schema() } }, pathGetter);
  expect(output).toEqual({
    kind: 'directory',
    path: './',
    contents: [
      {
        filetype: 'typescript',
        kind: 'file',
        path,
        contents: `import Schema from "@supschema/core/Schema";

export const Basic = Schema();
`,
      },
    ],
  });
});

it('nested schema values', async () => {
  const schema = Schema({ foo: 'bar', nested: [Schema({ value: 'x' })] });
  const path = 'test/test.ts';
  const output = generateSelfSourceFilesOutput({ [path]: { Complex: schema } }, pathGetter);
  expect(output).toEqual({
    kind: 'directory',
    path: './',
    contents: [
      {
        filetype: 'typescript',
        kind: 'file',
        path,
        contents: `import Schema from "@supschema/core/Schema";

export const Complex = Schema({
  foo: "bar",
  nested: [
    Schema({
      value: "x",
    })
  ],
});
`,
      },
    ],
  });
});

it('schema references', async () => {
  const Schema1 = Schema();
  const Schema2 = Schema({ nested: Schema1 });
  const Schema3 = Schema({ nested: modifyOpts(Schema2, { test: 1 }) });
  const path1 = 'test1.ts';
  const path2 = 'test2.ts';
  const output = generateSelfSourceFilesOutput({ [path1]: { Schema1, Schema2 }, [path2]: { Schema3 } }, pathGetter);
  expect(output).toEqual({
    kind: 'directory',
    path: './',
    contents: [
      {
        filetype: 'typescript',
        kind: 'file',
        path: path1,
        contents: `import Schema from "@supschema/core/Schema";

export const Schema1 = Schema();
export const Schema2 = Schema({
  nested: Schema1,
});
`,
      },
      {
        filetype: 'typescript',
        kind: 'file',
        path: path2,
        contents: `import Schema from "@supschema/core/Schema";
import { modifyOpts } from "@supschema/core";
import { Schema2 } from "./test1.js";

export const Schema3 = Schema({
  nested: modifyOpts(
    Schema2,
    {
      test: 1,
    }
  ),
});
`,
      },
    ],
  });
});
