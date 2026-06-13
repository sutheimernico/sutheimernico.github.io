// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Cloudflare Pages serves at the root, so no base path needed.
export default defineConfig({
  site: 'https://portfolio.pages.dev', // updated to the real domain after deploy task
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
