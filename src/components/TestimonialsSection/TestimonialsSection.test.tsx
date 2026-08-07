import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { testimonials } from '@/content/testimonials';
import { TestimonialsSection } from './TestimonialsSection';

vi.mock('next/image', () => ({
  default: ({
    alt,
    src,
    ...rest
  }: {
    alt: string;
    src: string;
    fill?: boolean;
    width?: number;
    height?: number;
    sizes?: string;
    className?: string;
  }) => {
    const { fill: _fill, sizes: _sizes, ...imgProps } = rest;
    return <img alt={alt} src={typeof src === 'string' ? src : ''} {...imgProps} />;
  },
}));

function formatCounter(index: number, total: number) {
  return `${String(index + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;
}

describe('TestimonialsSection', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('T15: autoplay advances quote/counter and region has aria-live polite', () => {
    vi.useFakeTimers();
    const items = testimonials.slice(0, 2);
    expect(items.length).toBeGreaterThanOrEqual(2);

    render(<TestimonialsSection items={items} />);

    expect(screen.getByText(items[0].quote)).toBeInTheDocument();
    expect(screen.getByText(formatCounter(0, items.length))).toBeInTheDocument();
    expect(screen.getByText('(o que os clientes dizem)')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /depoimento/i }),
    ).not.toBeInTheDocument();

    const liveRegion = screen.getByText(items[0].quote).closest('[aria-live]');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');

    act(() => {
      vi.advanceTimersByTime(7000);
    });

    expect(screen.getByText(items[1].quote)).toBeInTheDocument();
    expect(screen.getByText(formatCounter(1, items.length))).toBeInTheDocument();
    expect(screen.queryByText(items[0].quote)).not.toBeInTheDocument();
  });

  it('pauses autoplay when the section receives focus', () => {
    vi.useFakeTimers();
    const items = testimonials.slice(0, 2);
    expect(items.length).toBeGreaterThanOrEqual(2);

    render(<TestimonialsSection items={items} />);

    expect(screen.getByText(formatCounter(0, items.length))).toBeInTheDocument();

    fireEvent.focus(screen.getByRole('region', { name: 'Depoimentos' }));

    act(() => {
      vi.advanceTimersByTime(8000);
    });

    expect(screen.getByText(formatCounter(0, items.length))).toBeInTheDocument();
    expect(screen.getByText(items[0].quote)).toBeInTheDocument();
  });
});
