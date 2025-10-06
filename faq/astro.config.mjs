import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  out: 'static',  // Pastikan 'static' dalam tanda kutip
  integrations: [react()],
});
