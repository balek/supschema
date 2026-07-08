import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.{test,spec}.{ts,tsx}'],
    environment: 'node',
    globals: true,
    passWithNoTests: false,
  },
});
