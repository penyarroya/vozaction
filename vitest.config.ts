'@'
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules/**', 'dist/**'],
  },
});
'@ | Out-File -FilePath vitest.config.ts -Encoding utf8'