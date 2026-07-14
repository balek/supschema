import fs from 'node:fs/promises';

export const writeFiles = async (files: Record<string, string>) =>
  Promise.all(Object.entries(files).map(([path, content]) => fs.writeFile(path, content)));
