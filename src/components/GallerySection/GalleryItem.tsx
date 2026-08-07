import Image from 'next/image';
import { RiDoubleQuotesR } from 'react-icons/ri';
import type { GalleryImage, GalleryItem as GalleryItemData } from '@/content/types';
import './GallerySection.css';

type GalleryItemProps = {
  item: GalleryItemData;
};

function CardImage({
  image,
  sizes,
  width,
  height,
}: {
  image: GalleryImage;
  sizes: string;
  width: number;
  height: number;
}) {
  return (
    <Image
      className="gallery-card__image"
      src={image.src}
      alt={image.alt}
      width={width}
      height={height}
      sizes={sizes}
    />
  );
}

export function GalleryItem({ item }: GalleryItemProps) {
  if (item.kind === 'single') {
    return (
      <article className="gallery-card gallery-card--single">
        <figure className="gallery-card__media">
          <CardImage
            image={item.image}
            width={720}
            height={960}
            sizes="(max-width: 768px) 70vw, 32vw"
          />
        </figure>
      </article>
    );
  }

  if (item.kind === 'stack') {
    return (
      <article className="gallery-card gallery-card--stack">
        {item.images.map((image) => (
          <figure key={image.slug} className="gallery-card__media">
            <CardImage
              image={image}
              width={800}
              height={500}
              sizes="(max-width: 768px) 80vw, 38vw"
            />
          </figure>
        ))}
      </article>
    );
  }

  const isPortrait = item.image.aspect === 'portrait';

  return (
    <article className="gallery-card gallery-card--quote">
      <blockquote className="gallery-card__quote">
        <RiDoubleQuotesR
          className="gallery-card__quote-mark"
          aria-hidden="true"
        />
        <p className="gallery-card__quote-text">{item.text}</p>
      </blockquote>
      <figure
        className={
          isPortrait
            ? 'gallery-card__media gallery-card__media--portrait'
            : 'gallery-card__media gallery-card__media--landscape'
        }
      >
        <CardImage
          image={item.image}
          width={isPortrait ? 480 : 720}
          height={isPortrait ? 640 : 450}
          sizes="(max-width: 768px) 40vw, 14vw"
        />
      </figure>
    </article>
  );
}
