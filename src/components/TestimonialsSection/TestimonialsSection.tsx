'use client';

import Image from 'next/image';
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import type { Testimonial } from '@/content/types';
import { testimonials as defaultItems } from '@/content/testimonials';
import './TestimonialsSection.css';

type TestimonialsSectionProps = {
  items?: Testimonial[];
};

const AUTOPLAY_MS = 7000;
const SECTION_LABEL = '(o que os clientes dizem)';

function formatCounter(index: number, total: number) {
  return `${String(index + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;
}

export function TestimonialsSection({
  items = defaultItems,
}: TestimonialsSectionProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const total = items.length;
  const current = items[index];

  useEffect(() => {
    if (total < 2) return;

    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setIndex((prev) => (prev + 1) % total);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [total]);

  useEffect(() => {
    if (!paused) return;

    function resumeFromOutside(event: globalThis.MouseEvent) {
      const card = cardRef.current;
      if (card?.contains(event.target as Node)) return;
      pausedRef.current = false;
      setPaused(false);
    }

    document.addEventListener('click', resumeFromOutside);
    return () => document.removeEventListener('click', resumeFromOutside);
  }, [paused]);

  if (!current) return null;

  function togglePause(event: MouseEvent | KeyboardEvent) {
    if ('key' in event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
    } else {
      event.stopPropagation();
    }

    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
  }

  return (
    <section
      id="depoimentos"
      className="testimonials-section on-light"
      aria-label="Depoimentos"
    >
      <div
        ref={cardRef}
        className="testimonials-section__inner"
        role="button"
        tabIndex={0}
        aria-pressed={paused}
        aria-label={paused ? 'Retomar slideshow' : 'Pausar slideshow'}
        onClick={togglePause}
        onKeyDown={togglePause}
      >
        <div className="testimonials-section__meta">
          <p className="testimonials-section__counter" aria-hidden="true">
            {formatCounter(index, total)}
          </p>
          {total > 1 ? (
            <div
              className={
                paused
                  ? 'testimonials-section__progress testimonials-section__progress--paused'
                  : 'testimonials-section__progress'
              }
              aria-hidden="true"
            >
              <span
                key={index}
                className="testimonials-section__progress-bar"
                style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
              />
            </div>
          ) : null}
          <p className="testimonials-section__label">{SECTION_LABEL}</p>
        </div>

        <div className="testimonials-section__slide" aria-live="polite">
          <blockquote className="testimonials-section__quote">
            <span aria-hidden="true">“</span>
            {current.quote}
            <span aria-hidden="true">”</span>
          </blockquote>

          <div className="testimonials-section__author">
            <Image
              className="testimonials-section__avatar"
              src={current.avatar}
              alt={`Foto de ${current.authorName}`}
              width={56}
              height={56}
              sizes="56px"
            />
            <div>
              <p className="testimonials-section__name">{current.authorName}</p>
              <p className="testimonials-section__project">{current.projectType}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
