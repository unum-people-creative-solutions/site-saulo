import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { siteContacts, siteSocials } from '@/content/site';

import {
  StructuredData,
  buildOrganizationLd,
  parsePostalAddress,
} from './StructuredData';

describe('StructuredData', () => {
  it('parses the confirmed address into PostalAddress parts', () => {
    const address = parsePostalAddress(siteContacts.address);

    expect(address['@type']).toBe('PostalAddress');
    expect(address.streetAddress).toContain('Rua Fernando Falcão');
    expect(address.addressLocality).toBe('São Paulo');
    expect(address.addressRegion).toBe('SP');
    expect(address.postalCode).toBe('03180-003');
    expect(address.addressCountry).toBe('BR');
  });

  it('renders JSON-LD that parses and matches site contacts', () => {
    const { container } = render(<StructuredData />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).toBeTruthy();
    const parsed = JSON.parse(script!.textContent ?? '');

    expect(parsed['@type']).toBe('Organization');
    expect(parsed.telephone).toBe(siteContacts.phone);
    expect(parsed.email).toBe(siteContacts.email);
    expect(parsed.address.postalCode).toBe('03180-003');
    expect(parsed.sameAs).toEqual(siteSocials.map((s) => s.url));

    expect(buildOrganizationLd().telephone).toBe(siteContacts.phone);
  });
});
