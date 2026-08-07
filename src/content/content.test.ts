import { describe, expect, it } from 'vitest';
import { galleryItems } from './gallery';
import { processActs } from './process';
import { siteAboutBlocks, siteContacts, siteHeroText, siteSocials } from './site';
import { testimonials } from './testimonials';
import {
  GalleryItemSchema,
  ProcessActSchema,
  TestimonialSchema,
} from './types';

describe('content modules', () => {
  it('loads process acts validated by ProcessActSchema', () => {
    expect(processActs).toHaveLength(4);
    for (const act of processActs) {
      expect(ProcessActSchema.parse(act)).toEqual(act);
    }
  });

  it('loads gallery cards validated by GalleryItemSchema', () => {
    expect(galleryItems.length).toBeGreaterThanOrEqual(4);
    expect(galleryItems.length).toBeLessThanOrEqual(8);
    const kinds = new Set(galleryItems.map((item) => item.kind));
    expect(kinds.has('single')).toBe(true);
    expect(kinds.has('stack')).toBe(true);
    expect(kinds.has('quote')).toBe(true);
    for (const item of galleryItems) {
      expect(GalleryItemSchema.parse(item)).toEqual(item);
    }
  });

  it('loads testimonials validated by TestimonialSchema', () => {
    expect(testimonials.length).toBeGreaterThanOrEqual(3);
    expect(testimonials.length).toBeLessThanOrEqual(4);
    for (const item of testimonials) {
      expect(TestimonialSchema.parse(item)).toEqual(item);
      expect(item.isPlaceholder).toBe(true);
    }
  });

  it('exposes confirmed site contacts and socials without LinkedIn', () => {
    expect(siteContacts.phone).toBe('+55 11 98286 4003');
    expect(siteContacts.email).toBe('arquitetura@sauloarq.com');
    expect(siteHeroText.length).toBeGreaterThan(0);
    expect(siteAboutBlocks).toHaveLength(4);
    expect(siteSocials.map((s) => s.name)).toEqual(['Instagram', 'Pinterest']);
  });
});
