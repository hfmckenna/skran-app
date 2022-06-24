import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: 'node',
    exclude: [
      ...configDefaults.exclude,
      '**/*.spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
  },
});
