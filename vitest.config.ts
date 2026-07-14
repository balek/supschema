import { defineConfig } from 'vitest/config';

export default defineConfig({
  ssr: {
    resolve: {
      conditions: ['subschema-dev', 'import', 'default'],
    },
  },
  test: {
    include: ['**/*.{test,spec}.{ts,tsx}'],
    environment: 'node',
    globals: true,
    passWithNoTests: false,
  },
});
