'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { GalleryItem as GalleryItemData } from '@/content/types';
import { galleryItems as defaultItems } from '@/content/gallery';
import { GalleryItem } from './GalleryItem';
import './GallerySection.css';

type GallerySectionProps = {
  items?: GalleryItemData[];
};

export type GallerySectionHandle = {
  sectionEl: HTMLElement;
  trackEl: HTMLElement;
};

function getRequiredElement<T extends HTMLElement>(
  element: T | null,
  label: string,
): T {
  if (!element) {
    throw new Error(`GallerySection missing ${label}`);
  }

  return element;
}

export const GallerySection = forwardRef<GallerySectionHandle, GallerySectionProps>(
  function GallerySection({ items = defaultItems }, ref) {
    const sectionRef = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        get sectionEl() {
          return getRequiredElement(sectionRef.current, 'sectionEl');
        },
        get trackEl() {
          return getRequiredElement(trackRef.current, 'trackEl');
        },
      }),
      [],
    );

    return (
      <section
        ref={sectionRef}
        id="galeria"
        className="gallery-section"
        aria-label="Galeria"
      >
        <div
          ref={trackRef}
          className="gallery-section__track"
          tabIndex={0}
          aria-label="Galeria horizontal de projetos"
        >
          {items.map((item, index) => (
            <GalleryItem
              key={
                item.kind === 'quote'
                  ? `quote-${index}`
                  : item.kind === 'single'
                    ? item.image.slug
                    : item.images.map((img) => img.slug).join('+')
              }
              item={item}
            />
          ))}
        </div>
      </section>
    );
  },
);

GallerySection.displayName = 'GallerySection';
