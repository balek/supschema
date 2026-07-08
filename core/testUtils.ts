import { SchemaPathGetter } from './pathGetter';

const basePath = new URL('..', import.meta.url).href;
export const testPathGetter: SchemaPathGetter = (m) =>
  m.url
    .replace(basePath, '@supschema/')
    .replace(/\.ts$/, '')
    .replace(/\/index$/, '');
