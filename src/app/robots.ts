import type { MetadataRoute } from 'next';

import { siteUrl } from '@/content/site';

/** Path reservado para o vídeo do processo (TECH-DESIGN §7.4) — nunca indexável. */
export const PROCESS_VIDEO_DISALLOW = '/media/processo-video/';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [PROCESS_VIDEO_DISALLOW],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
