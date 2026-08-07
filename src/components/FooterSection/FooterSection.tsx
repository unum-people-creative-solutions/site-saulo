'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { TextButton } from '@/components/TextButton/TextButton';
import { Wordmark } from '@/components/Wordmark/Wordmark';
import { useLead } from '@/context/LeadContext';
import { siteContacts, siteSocials } from '@/content/site';
import './FooterSection.css';

function toTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return `tel:${digits}`;
}

const navLinks = [
  { href: '#sobre', label: 'SOBRE' },
  { href: '#processo', label: 'PROCESSO' },
  { href: '#galeria', label: 'GALERIA' },
] as const;

export type FooterSectionHandle = {
  sectionEl: HTMLElement;
  titleEl: HTMLElement;
};

function getRequiredElement<T extends HTMLElement>(
  element: T | null,
  label: string,
): T {
  if (!element) {
    throw new Error(`FooterSection missing ${label}`);
  }

  return element;
}

export const FooterSection = forwardRef<FooterSectionHandle>(function FooterSection(
  _props,
  ref,
) {
  const { openModal } = useLead();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      get sectionEl() {
        return getRequiredElement(sectionRef.current, 'sectionEl');
      },
      get titleEl() {
        return getRequiredElement(titleRef.current, 'titleEl');
      },
    }),
    [],
  );

  return (
    <footer ref={sectionRef} className="footer-section">
      <div className="footer-section__scrim">
        <h2 ref={titleRef} className="footer-section__title">
          <TextButton variant="onDark" onClick={openModal}>
            Iniciar um contato.
          </TextButton>
        </h2>

        <div className="footer-section__middle">
          <nav className="footer-section__nav" aria-label="Navegação">
            <ul className="footer-section__nav-list">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-section__columns">
            <div className="footer-section__column">
              <p className="footer-section__label">Contatos</p>
              <ul className="footer-section__list">
                <li>
                  <a href={toTelHref(siteContacts.phone)}>{siteContacts.phone}</a>
                </li>
                <li>
                  <a href={`mailto:${siteContacts.email}`}>{siteContacts.email}</a>
                </li>
              </ul>
            </div>

            <div className="footer-section__column">
              <p className="footer-section__label">Social</p>
              <ul className="footer-section__list">
                {siteSocials.map(({ name, url }) => (
                  <li key={name}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-section__column">
              <p className="footer-section__label">Endereço</p>
              <p className="footer-section__address">{siteContacts.address}</p>
            </div>
          </div>
        </div>

        <div className="footer-section__bottom">
          <div className="footer-section__brand">
            <Wordmark variant="stacked" />
          </div>
          <a href="#hero" className="footer-section__back-to-top">
            <ArrowUp
              className="footer-section__back-to-top-icon"
              strokeWidth={1.25}
              aria-hidden="true"
            />
            <span>Voltar ao topo</span>
          </a>
        </div>
      </div>
    </footer>
  );
});

FooterSection.displayName = 'FooterSection';
