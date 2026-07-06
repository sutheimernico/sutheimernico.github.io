import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildSitemap } from '../lib/sitemap';

export const GET: APIRoute = async ({ site }) => {
  const projects = await getCollection('projects');
  const paths = ['/', ...projects.map((p) => `/projects/${p.id}`)];
  if (!site) throw new Error('`site` must be set in astro.config.mjs');
  const body = buildSitemap(site.href, paths);
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
