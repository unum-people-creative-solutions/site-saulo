import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { LeadProvider } from '@/context/LeadContext';

import Page from './page';

vi.mock('next/image', () => ({
  default: function MockImage({
    alt,
    src,
    priority: _priority,
    fill: _fill,
    sizes: _sizes,
    ...rest
  }: {
    alt: string;
    src: string;
    priority?: boolean;
    fill?: boolean;
    sizes?: string;
    width?: number;
    height?: number;
    className?: string;
  }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={alt} src={typeof src === 'string' ? src : ''} {...rest} />
    );
  },
}));

function renderPage() {
  return render(
    <LeadProvider>
      <Page />
    </LeadProvider>,
  );
}

describe('Home page composition', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('T10: composed page has exactly one heading level 1', () => {
    renderPage();

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
  });

  it('T10b: composed page heading hierarchy does not skip levels', () => {
    renderPage();

    const allHeadings = screen.getAllByRole('heading');
    const levels = allHeadings.map((heading) =>
      Number(heading.tagName.replace(/^H/i, '')),
    );

    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i]).toBeLessThanOrEqual(levels[i - 1] + 1);
    }
  });

  it('T17: footer anchors #sobre, #processo, #galeria have matching section ids', () => {
    const { container } = renderPage();

    expect(screen.getByRole('link', { name: 'SOBRE' })).toHaveAttribute(
      'href',
      '#sobre',
    );
    expect(screen.getByRole('link', { name: 'PROCESSO' })).toHaveAttribute(
      'href',
      '#processo',
    );
    expect(screen.getByRole('link', { name: 'GALERIA' })).toHaveAttribute(
      'href',
      '#galeria',
    );

    expect(container.querySelector('#sobre')).not.toBeNull();
    expect(container.querySelector('#processo')).not.toBeNull();
    expect(container.querySelector('#galeria')).not.toBeNull();
  });
});
