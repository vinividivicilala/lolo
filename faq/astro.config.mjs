// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  build: {
    outDir: '../public/faq',   // hasil build masuk ke public/faq
  },
  site: 'https://noted-farid.netlify.app',
});
