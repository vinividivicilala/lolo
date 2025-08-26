// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  build: {
    outDir: '../public/faq',   // hasil Astro ke public/faq
  },
  site: 'https://noted-farid.netlify.app',
});
