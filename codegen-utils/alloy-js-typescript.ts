import { getSymbolCreator, useBinder, Refkey } from '@alloy-js/core';
import { createPackage } from '@alloy-js/typescript';

export const importRef = (path: string, name: string = 'default') => {
  const binder = useBinder();
  if (!binder) throw new Error('No binder found in context. Make sure to call this function within a Binder context.');

  const hackContext = binder as { importRefs?: Record<string, Record<string, Refkey>> };
  const importRefs = (hackContext.importRefs ??= {});
  if (!importRefs[path]) importRefs[path] = {};

  const pathRefs = importRefs[path];
  if (pathRefs[name]) return pathRefs[name];

  const defaultName =
    path
      .replace(/\.[^.]+$/, '')
      .split('/')
      .findLast((p) => p !== 'index') ?? path;
  const pkg = createPackage({
    name: path,
    version: '',
    descriptor: {
      '.': name === 'default' ? { default: defaultName } : { named: [name] },
    },
  });
  getSymbolCreator(pkg)(binder);

  pathRefs[name] = pkg[name as never];
  return pathRefs[name];
};
