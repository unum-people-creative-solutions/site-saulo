import type { Metadata } from 'next';

import {
  siteDescription,
  siteName,
  siteTitle,
  siteUrl,
} from '@/content/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName,
    images: [
      {
        url: '/og/cover.jpg',
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/og/cover.jpg'],
  },
};
