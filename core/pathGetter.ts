export type SchemaPathGetter = (importMeta: ImportMeta) => string;
const nodeModulesPath = new URL('../..', import.meta.url).href;
export const nodeModulesSchemaPathGetter: SchemaPathGetter = (m) =>
  m.url
    .replace(nodeModulesPath, '')
    .replace(/\.ts$/, '')
    .replace(/\/index$/, '');
