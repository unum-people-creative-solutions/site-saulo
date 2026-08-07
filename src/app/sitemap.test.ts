import { describe, expect, it } from 'vitest';

import { siteUrl } from '@/content/site';

import sitemap from './sitemap';

describe('sitemap', () => {
  it('returns the home entry with lastModified, changeFrequency and priority', () => {
    const entries = sitemap();

    expect(entries).toHaveLength(1);
    expect(entries[0]?.url).toBe(`${siteUrl}/`);
    expect(entries[0]?.lastModified).toBeInstanceOf(Date);
    expect(entries[0]?.changeFrequency).toBe('monthly');
    expect(entries[0]?.priority).toBe(1);
    expect(entries[0]?.url).not.toContain('processo-video');
  });
});
