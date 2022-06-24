import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        exclude: [
            ...configDefaults.exclude,
            '**/*.spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        ],
        globals: true,
        environment: 'jsdom',
    },
});
