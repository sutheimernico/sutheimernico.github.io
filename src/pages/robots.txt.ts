import type { APIRoute } from 'astro';

// Generated (not a static public/ file) so the Sitemap URL always tracks
// astro.config.mjs's `site` — no separate place to remember to update on deploy.
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('`site` must be set in astro.config.mjs');
  const base = site.href.replace(/\/$/, '');
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
