import { describe, it, expect } from 'vitest';
import { buildSitemap } from './sitemap';

describe('buildSitemap', () => {
  it('builds one <url> per path, joined to the site origin', () => {
    const xml = buildSitemap('https://example.com', ['/', '/projects/foo']);
    expect(xml).toContain('<loc>https://example.com/</loc>');
    expect(xml).toContain('<loc>https://example.com/projects/foo</loc>');
  });

  it('strips a trailing slash from the site URL before joining', () => {
    const xml = buildSitemap('https://example.com/', ['/about']);
    expect(xml).toContain('<loc>https://example.com/about</loc>');
    expect(xml).not.toContain('.com//about');
  });

  it('emits a valid urlset root with the sitemaps.org namespace', () => {
    const xml = buildSitemap('https://example.com', ['/']);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });
});
