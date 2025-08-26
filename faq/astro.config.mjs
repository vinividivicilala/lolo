// faq/astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  build: {
    outDir: '../public/faq',   // hasil build keluar ke root/public/faq
  },
});
