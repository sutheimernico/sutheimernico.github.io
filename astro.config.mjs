// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Cloudflare Pages serves at the root, so no base path needed.
export default defineConfig({
  // Placeholder — UPDATE ON DEPLOY to the real domain. Absolute OG/Twitter
  // image + canonical/og:url in Base.astro are derived from this via Astro.site,
  // so social-share previews break until it points at the live host.
  site: 'https://portfolio.pages.dev',
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
