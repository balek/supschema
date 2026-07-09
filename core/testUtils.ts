import { SchemaPathGetter } from './pathGetter.js';

const basePath = new URL('..', import.meta.url).href;
export const testPathGetter: SchemaPathGetter = (m) =>
  m.url
    .replace(basePath, '@supschema/')
    .replace(/\.ts$/, '')
    .replace(/\/index$/, '');
