import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildSitemap } from '../lib/sitemap';

export const GET: APIRoute = async ({ site }) => {
  const projects = await getCollection('projects');
  const paths = ['/', ...projects.map((p) => `/projects/${p.id}`)];
  const body = buildSitemap(site?.href ?? 'https://portfolio.pages.dev', paths);
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
