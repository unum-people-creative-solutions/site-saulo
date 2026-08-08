'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { siteAboutBlocks } from '@/content/site';
import './AboutSection.css';

export type AboutSectionHandle = {
  sectionEl: HTMLElement;
  blockEls: HTMLElement[];
};

function getRequiredElement<T extends HTMLElement>(
  element: T | null,
  label: string,
): T {
  if (!element) {
    throw new Error(`AboutSection missing ${label}`);
  }

  return element;
}

export const AboutSection = forwardRef<AboutSectionHandle>(function AboutSection(
  _props,
  ref,
) {
  const sectionRef = useRef<HTMLElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      get sectionEl() {
        return getRequiredElement(sectionRef.current, 'sectionEl');
      },
      get blockEls() {
        return Array.from(
          getRequiredElement(sectionRef.current, 'sectionEl').querySelectorAll<HTMLElement>(
            '.about-section__block',
          ),
        );
      },
    }),
    [],
  );

  return (
    <section
      ref={sectionRef}
      id="sobre"
      className="about-section"
      aria-labelledby="sobre-title"
    >
      <div className="about-section__inner">
        <h2 id="sobre-title" className="about-section__title about-section__title--sr-only">
          Sobre
        </h2>
        <div className="about-section__blocks">
          {siteAboutBlocks.map((block) => (
            <p key={block} className="about-section__block">
              {block}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';
