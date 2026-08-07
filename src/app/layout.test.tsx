import { describe, expect, it } from 'vitest';

import { siteDescription, siteTitle } from '@/content/site';

import { metadata } from './site-metadata';

describe('root layout metadata', () => {
  it('exports non-empty title, description and Open Graph image', () => {
    expect(metadata.title).toBe(siteTitle);
    expect(String(metadata.title).length).toBeGreaterThan(0);

    expect(metadata.description).toBe(siteDescription);
    expect(String(metadata.description).length).toBeGreaterThan(0);

    expect(metadata.metadataBase).toBeInstanceOf(URL);
    expect(metadata.alternates?.canonical).toBe('/');

    const images = metadata.openGraph?.images;
    expect(Array.isArray(images)).toBe(true);
    expect(images?.length).toBeGreaterThan(0);

    const first = Array.isArray(images) ? images[0] : undefined;
    expect(first).toBeTruthy();
    if (first && typeof first === 'object' && 'url' in first) {
      expect(String(first.url).length).toBeGreaterThan(0);
      expect(first.url).toBe('/og/cover.jpg');
      expect(first.width).toBe(1200);
      expect(first.height).toBe(630);
    }

    expect(metadata.openGraph?.type).toBe('website');
    expect(metadata.openGraph?.locale).toBe('pt_BR');
    expect(metadata.twitter?.card).toBe('summary_large_image');
  });
});
