import type { CSSProperties } from 'react';
import Image from 'next/image';
import './Wordmark.css';

type WordmarkVariant = 'hero' | 'sticky' | 'stacked';

type WordmarkProps = {
  variant: WordmarkVariant;
};

const lockupStyle: CSSProperties = {
  letterSpacing: 'var(--tracking-wordmark, 0.62em)',
};

const semibold: CSSProperties = { fontWeight: 600 };
const light: CSSProperties = { fontWeight: 300 };
const bold: CSSProperties = { fontWeight: 700 };

function TextLockup() {
  return (
    <span aria-hidden="true" className="wordmark__lockup" style={lockupStyle}>
      <span style={semibold}>SAULO MAGNO</span>{' '}
      <span style={light}>ARQUIT</span>{' '}
      <span style={light}>ETOS</span>{' '}
      <span style={bold}>.</span>
    </span>
  );
}

export function Wordmark({ variant }: WordmarkProps) {
  if (variant === 'stacked') {
    return (
      <span className="wordmark wordmark--stacked">
        <Image
          className="wordmark__image"
          src="/brand/logo.png"
          alt="Saulo Magno Arquitetos"
          width={256}
          height={256}
          sizes="(max-width: 639px) 56vw, min(22.4rem, 36.8vmin)"
        />
      </span>
    );
  }

  return (
    <span
      className={`wordmark wordmark--${variant}`}
      role="img"
      aria-label="Saulo Magno Arquitetos"
    >
      <TextLockup />
    </span>
  );
}
