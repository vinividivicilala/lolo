// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  build: {
    outDir: '../public/faq',   // build ke repo/public/faq
  },
});
