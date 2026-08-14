'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Wordmark } from '@/components/Wordmark/Wordmark';
import { TextButton } from '@/components/TextButton/TextButton';
import { ScrollCue } from '@/components/ScrollCue/ScrollCue';
import { useLead } from '@/context/LeadContext';
import { siteHeroText } from '@/content/site';
import { HeroMedia } from './HeroMedia';
import './HeroSection.css';

export type HeroSectionHandle = {
  sectionEl: HTMLElement;
  imageEl: HTMLElement;
  backdropEl: HTMLElement;
  headerGroupEl: HTMLElement;
};

function getRequiredElement<T extends HTMLElement>(
  element: T | null,
  label: string,
): T {
  if (!element) {
    throw new Error(`HeroSection missing ${label}`);
  }

  return element;
}

export const HeroSection = forwardRef<HeroSectionHandle>(function HeroSection(
  _props,
  ref,
) {
  const { openModal } = useLead();
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const headerGroupRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      get sectionEl() {
        return getRequiredElement(sectionRef.current, 'sectionEl');
      },
      get imageEl() {
        return getRequiredElement(imageRef.current, 'imageEl');
      },
      get backdropEl() {
        return getRequiredElement(backdropRef.current, 'backdropEl');
      },
      get headerGroupEl() {
        return getRequiredElement(headerGroupRef.current, 'headerGroupEl');
      },
    }),
    [],
  );

  return (
    <>
      {/*
        Sibling of <section id="hero">, not a descendant: every section
        (including this one) uses `isolation: isolate` + `overflow: hidden`
        for its own internal background/scrim layering, which clips/traps a
        `position: fixed` descendant the moment its ancestor scrolls out of
        view. This is the single, persistent, transparent header — it is
        always `position: fixed` (see HeroSection.css) and only ever animates
        a `y` transform (near viewport middle → 0 as the Hero scrolls), so it
        never needs to change appearance, visibility, or DOM identity.
      */}
      <div ref={headerGroupRef} className="hero-section__header">
        <div className="hero-section__header-group">
          <h1 className="hero-section__title">
            <Wordmark variant="hero" />
          </h1>
        </div>

        <TextButton variant="onDark" onClick={openModal}>
          QUERO FALAR SOBRE UM PROJETO
        </TextButton>
      </div>

      {/*
        Shared Hero+Sobre backdrop — also a sibling so overflow/isolation on
        #hero / #sobre cannot clip the fixed video. heroBackdrop.ts keeps it
        visible until the Sobre pin finishes, then hides it.
      */}
      <div
        ref={backdropRef}
        className="hero-section__backdrop"
        aria-hidden="true"
      >
        <div className="hero-section__frame">
          <div ref={imageRef} className="hero-section__image-layer">
            <HeroMedia />
          </div>
          <div className="hero-section__scrim" />
        </div>
      </div>

      <section ref={sectionRef} id="hero" className="hero-section">
        <div className="hero-section__content">
          <div className="hero-section__phrase-wrap">
            <p
              className="hero-section__phrase"
              style={{ textWrap: 'balance' }}
            >
              {siteHeroText}
            </p>
          </div>
        </div>

        <div className="hero-section__cue">
          <ScrollCue />
        </div>
      </section>
    </>
  );
});

HeroSection.displayName = 'HeroSection';
