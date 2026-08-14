'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { TextButton } from '@/components/TextButton/TextButton';
import { Wordmark } from '@/components/Wordmark/Wordmark';
import { useLead } from '@/context/LeadContext';
import { siteContacts, siteSocials } from '@/content/site';
import './FooterSection.css';

function toTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return `tel:${digits}`;
}

function toMapsHref(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
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
              {navLinks.map(({ href, label }, index) => (
                <li key={href}>
                  {index > 0 ? ', ' : null}
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
                  <a
                    className="footer-section__split-row"
                    href={toTelHref(siteContacts.phone)}
                  >
                    <span className="footer-section__split-desc">Telefone</span>
                    <span className="footer-section__split-value">
                      {siteContacts.phone}
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    className="footer-section__split-row"
                    href={`mailto:${siteContacts.email}`}
                  >
                    <span className="footer-section__split-desc">E-mail</span>
                    <span className="footer-section__split-value">
                      {siteContacts.email}
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-section__column">
              <p className="footer-section__label">Social</p>
              <ul className="footer-section__list">
                {siteSocials.map(({ name, handle, url }) => (
                  <li key={name}>
                    <a
                      className="footer-section__split-row"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="footer-section__split-desc">{name}</span>
                      <span className="footer-section__split-value">{handle}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-section__column">
              <p className="footer-section__label">Endereço</p>
              <a
                className="footer-section__address"
                href={toMapsHref(siteContacts.address)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {siteContacts.addressLines.map((line) => (
                  <span key={line} className="footer-section__address-line">
                    {line}
                  </span>
                ))}
              </a>
            </div>
          </div>
        </div>

        <div className="footer-section__bottom">
          <div className="footer-section__brand">
            <Wordmark variant="stacked" />
          </div>
          <a href="#hero" className="footer-section__back-to-top">
            <span className="footer-section__back-to-top-icon" aria-hidden="true">
              &#8593;
            </span>
            <span>Back to top</span>
          </a>
        </div>
      </div>
    </footer>
  );
});

FooterSection.displayName = 'FooterSection';
