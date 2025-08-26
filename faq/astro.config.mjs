// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',             // build jadi HTML statis
  build: {
    outDir: '../public/faq',    // hasil build masuk ke public/faq
  },
  site: 'https://life-is-what-it-is-learn.netlify.app',
});
