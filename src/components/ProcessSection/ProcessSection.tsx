'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  processActs,
  processClosing,
  processCta,
  processSubtitle,
  processTitle,
} from '@/content/process';
import { TextButton } from '@/components/TextButton/TextButton';
import { VideoModal } from '@/components/VideoModal/VideoModal';
import { ProcessCard } from './ProcessCard';
import './ProcessSection.css';

export type ProcessSectionHandle = {
  sectionEl: HTMLElement;
  titleEl: HTMLElement;
  subtitleEl: HTMLElement;
  cardEls: HTMLElement[];
  closingEl: HTMLElement;
  ctaEl: HTMLElement;
};

function getRequiredElement<T extends HTMLElement>(
  element: T | null,
  label: string,
): T {
  if (!element) {
    throw new Error(`ProcessSection missing ${label}`);
  }

  return element;
}

function getRequiredDescendant<T extends HTMLElement>(
  sectionEl: HTMLElement,
  selector: string,
  label: string,
): T {
  const element = sectionEl.querySelector<T>(selector);

  if (!element) {
    throw new Error(`ProcessSection missing ${label}`);
  }

  return element;
}

export const ProcessSection = forwardRef<ProcessSectionHandle>(
  function ProcessSection(_props, ref) {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        get sectionEl() {
          return getRequiredElement(sectionRef.current, 'sectionEl');
        },
        get titleEl() {
          return getRequiredDescendant(
            getRequiredElement(sectionRef.current, 'sectionEl'),
            '.process-section__title',
            'titleEl',
          );
        },
        get subtitleEl() {
          return getRequiredDescendant(
            getRequiredElement(sectionRef.current, 'sectionEl'),
            '.process-section__subtitle',
            'subtitleEl',
          );
        },
        get cardEls() {
          return Array.from(
            getRequiredElement(sectionRef.current, 'sectionEl').querySelectorAll<HTMLElement>(
              '.process-card',
            ),
          );
        },
        get closingEl() {
          return getRequiredDescendant(
            getRequiredElement(sectionRef.current, 'sectionEl'),
            '.process-section__closing',
            'closingEl',
          );
        },
        get ctaEl() {
          return getRequiredDescendant(
            getRequiredElement(sectionRef.current, 'sectionEl'),
            '.process-section__cta',
            'ctaEl',
          );
        },
      }),
      [],
    );

    return (
      <section
        ref={sectionRef}
        id="processo"
        className="process-section"
        aria-labelledby="processo-title"
      >
        <div className="process-section__background" aria-hidden="true" />
        <div className="process-section__scrim" aria-hidden="true" />
        <div className="process-section__content">
          <header className="process-section__header">
            <h2 id="processo-title" className="process-section__title">
              {processTitle}
            </h2>
            <p className="process-section__subtitle">{processSubtitle}</p>
          </header>

          <div className="process-section__cards">
            {processActs.map((act) => (
              <ProcessCard key={act.index} act={act} />
            ))}
          </div>

          <p className="process-section__closing">{processClosing}</p>

          <div className="process-section__cta">
            <TextButton variant="onDark" onClick={() => setIsVideoOpen(true)}>
              {processCta}
            </TextButton>
          </div>
        </div>

        <VideoModal open={isVideoOpen} onOpenChange={setIsVideoOpen} />
      </section>
    );
  },
);

ProcessSection.displayName = 'ProcessSection';
