import js from '@eslint/js';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', '.playwright/**', 'public/mediapipe/**', 'artifacts/**', 'test-results/**', 'playwright-report/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['scripts/*.mjs'], languageOptions: { globals: { console: 'readonly', process: 'readonly', fetch: 'readonly', Buffer: 'readonly', navigator: 'readonly', document: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly' } } },
);
