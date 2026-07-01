/** Framework-agnostic sitemap XML builder — pure so it's unit-testable without astro:content. */

export function buildSitemap(siteUrl: string, paths: string[]): string {
  const base = siteUrl.replace(/\/$/, '');
  const urls = paths
    .map((path) => `  <url><loc>${base}${path}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
