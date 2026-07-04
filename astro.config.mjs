// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages user site (sutheimernico.github.io) serves at the root, so no base path needed.
export default defineConfig({
  // Absolute OG/Twitter image + canonical/og:url in Base.astro are derived
  // from this via Astro.site — update if the site moves to a custom domain.
  site: 'https://sutheimernico.github.io',
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
