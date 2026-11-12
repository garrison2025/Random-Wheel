import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://numberspinner.com',
  output: 'static',
  devToolbar: { enabled: false },
  trailingSlash: 'always',
  build: { format: 'directory' },
  vite: { build: { target: 'es2022' } },
});
