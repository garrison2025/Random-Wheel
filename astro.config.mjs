import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  devToolbar: { enabled: false },
  trailingSlash: 'always',
  build: { format: 'directory' },
  vite: { build: { target: 'es2022' } },
});
