import { describe, expect, it } from 'vitest';

import { siteUrl } from '@/content/site';

import robots, { PROCESS_VIDEO_DISALLOW } from './robots';

describe('robots', () => {
  it('allows the site and disallows the process video media path', () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;

    expect(rules?.userAgent).toBe('*');
    expect(rules?.allow).toBe('/');
    expect(rules?.disallow).toEqual([PROCESS_VIDEO_DISALLOW]);
    expect(PROCESS_VIDEO_DISALLOW).toBe('/media/processo-video/');
    expect(result.sitemap).toBe(`${siteUrl}/sitemap.xml`);
  });
});
