'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { AboutSection, type AboutSectionHandle } from '@/components/AboutSection/AboutSection';
import { FooterSection, type FooterSectionHandle } from '@/components/FooterSection/FooterSection';
import { GallerySection, type GallerySectionHandle } from '@/components/GallerySection/GallerySection';
import { HeroSection, type HeroSectionHandle } from '@/components/HeroSection/HeroSection';
import { ProcessSection, type ProcessSectionHandle } from '@/components/ProcessSection/ProcessSection';
import { ScrollArrow, type ScrollArrowHandle } from '@/components/ScrollArrow/ScrollArrow';
import { TestimonialsSection } from '@/components/TestimonialsSection/TestimonialsSection';
import { registerMotionContexts } from '@/lib/animations/motionPreferences';
import { aboutReveal } from '@/lib/animations/scenes/aboutReveal';
import { footerRise } from '@/lib/animations/scenes/footerRise';
import { galleryHorizontal } from '@/lib/animations/scenes/galleryHorizontal';
import { headerContrast } from '@/lib/animations/scenes/headerContrast';
import { heroBackdrop } from '@/lib/animations/scenes/heroBackdrop';
import { heroMobilePan } from '@/lib/animations/scenes/heroMobilePan';
import { heroParallax } from '@/lib/animations/scenes/heroParallax';
import { processCascade } from '@/lib/animations/scenes/processCascade';
import { scrollArrow } from '@/lib/animations/scenes/scrollArrow';
import { stickyHeader } from '@/lib/animations/scenes/stickyHeader';

function getRequiredDescendant<T extends HTMLElement>(
  root: ParentNode,
  selector: string,
  label: string,
): T {
  const element = root.querySelector<T>(selector);

  if (!element) {
    throw new Error(`MotionOrchestrator missing ${label}`);
  }

  return element;
}

function runScene(
  scope: Element,
  setup: () => void | (() => void),
): () => void {
  let cleanup: (() => void) | void;

  const ctx = gsap.context(() => {
    cleanup = setup();
  }, scope);

  return () => {
    cleanup?.();
    ctx.revert();
  };
}

export function MotionOrchestrator() {
  const heroRef = useRef<HeroSectionHandle>(null);
  const aboutRef = useRef<AboutSectionHandle>(null);
  const processRef = useRef<ProcessSectionHandle>(null);
  const galleryRef = useRef<GallerySectionHandle>(null);
  const footerRef = useRef<FooterSectionHandle>(null);
  const scrollArrowRef = useRef<ScrollArrowHandle>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const about = aboutRef.current;
    const process = processRef.current;
    const gallery = galleryRef.current;
    const footer = footerRef.current;
    const scrollArrowHandle = scrollArrowRef.current;

    if (!hero || !about || !process || !gallery || !footer || !scrollArrowHandle) {
      return;
    }

    const testimonialsEl = getRequiredDescendant<HTMLElement>(
      document,
      '#depoimentos',
      'testimonials section',
    );

    const heroTitleEl = getRequiredDescendant<HTMLElement>(
      hero.headerGroupEl,
      '.hero-section__title',
      'hero title',
    );
    const heroCtaEl = getRequiredDescendant<HTMLElement>(
      hero.headerGroupEl,
      '.text-button',
      'hero CTA',
    );

    const mm = gsap.matchMedia();

    registerMotionContexts(mm, {
      full: () => {
        const cleanups = [
          // aboutReveal first so its pin-spacer exists before backdrop/parallax
          // bind endTrigger: about bottom.
          runScene(about.sectionEl, () =>
            aboutReveal(about.sectionEl, about.blockEls),
          ),
          // Mouse parallax only — no scroll-linked drift on the shared backdrop.
          // Spans Hero + Sobre (shared backdrop); scope to hero.sectionEl
          // since about.sectionEl's own scene (aboutReveal) owns its scope.
          runScene(hero.sectionEl, () =>
            heroParallax(hero.imageEl, hero.sectionEl, about.sectionEl),
          ),
          runScene(hero.headerGroupEl, () =>
            stickyHeader(hero.sectionEl, heroTitleEl, heroCtaEl),
          ),
          runScene(process.sectionEl, () =>
            processCascade(
              process.sectionEl,
              process.titleEl,
              process.subtitleEl,
              process.cardEls,
              process.closingEl,
              process.ctaEl,
            ),
          ),
          runScene(gallery.sectionEl, () =>
            galleryHorizontal(gallery.sectionEl, gallery.trackEl),
          ),
          runScene(footer.sectionEl, () =>
            footerRise(footer.sectionEl, footer.titleEl),
          ),
          runScene(gallery.sectionEl, () =>
            scrollArrow(
              scrollArrowHandle.el,
              gallery.sectionEl,
              testimonialsEl,
              footer.sectionEl,
            ),
          ),
        ];

        return () => {
          for (const cleanup of cleanups) {
            cleanup();
          }
        };
      },
      mobile: () => {
        const cleanups = [
          // Same pinned text reveal as desktop — blocks scrub in via opacity/y.
          runScene(about.sectionEl, () =>
            aboutReveal(about.sectionEl, about.blockEls),
          ),
          runScene(hero.sectionEl, () =>
            heroMobilePan(hero.imageEl, hero.sectionEl, about.sectionEl),
          ),
          // Per-card viewport reveals — each act fades in as it hits ~80vh.
          runScene(process.sectionEl, () =>
            processCascade(
              process.sectionEl,
              process.titleEl,
              process.subtitleEl,
              process.cardEls,
              process.closingEl,
              process.ctaEl,
              { mode: 'per-card' },
            ),
          ),
          runScene(gallery.sectionEl, () =>
            scrollArrow(
              scrollArrowHandle.el,
              gallery.sectionEl,
              testimonialsEl,
              footer.sectionEl,
            ),
          ),
          // Same CTA handoff as desktop: "Iniciar um contato." rises from the
          // testimonials paper bridge into the footer (scrub + ink→white).
          runScene(footer.sectionEl, () =>
            footerRise(footer.sectionEl, footer.titleEl),
          ),
        ];

        return () => {
          for (const cleanup of cleanups) {
            cleanup();
          }
        };
      },
      reduced: () => {},
    });

    // Release only after Journey (#processo) leaves — Sobre can still be
    // partially visible while Journey scrolls in. Runs once (not inside
    // overlapping matchMedia handlers).
    const backdropCleanup = runScene(hero.backdropEl, () =>
      heroBackdrop(hero.backdropEl, process.sectionEl),
    );
    const contrastCleanup = runScene(hero.headerGroupEl, () =>
      headerContrast(hero.headerGroupEl),
    );

    return () => {
      backdropCleanup();
      contrastCleanup();
      mm.revert();
    };
  }, []);

  return (
    <>
      <HeroSection ref={heroRef} />
      <AboutSection ref={aboutRef} />
      <ProcessSection ref={processRef} />
      <GallerySection ref={galleryRef} />
      <TestimonialsSection />
      <FooterSection ref={footerRef} />
      <ScrollArrow ref={scrollArrowRef} />
    </>
  );
}
