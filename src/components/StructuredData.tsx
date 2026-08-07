import {
  siteContacts,
  siteDescription,
  siteName,
  siteSocials,
  siteUrl,
} from '@/content/site';

export type PostalAddressLd = {
  '@type': 'PostalAddress';
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
};

/** Parse básico do endereço confirmado em `siteContacts.address`. */
export function parsePostalAddress(address: string): PostalAddressLd {
  const match = address.match(
    /^(.*?),\s*([^,]+)-([A-Z]{2}),\s*(\d{5}-\d{3})\s*$/,
  );

  if (!match) {
    return {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      postalCode: '',
      addressCountry: 'BR',
    };
  }

  const [, streetAddress, addressLocality, addressRegion, postalCode] = match;

  return {
    '@type': 'PostalAddress',
    streetAddress: streetAddress.trim(),
    addressLocality: addressLocality.trim(),
    addressRegion,
    postalCode,
    addressCountry: 'BR',
  };
}

export function buildOrganizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    description: siteDescription,
    url: siteUrl,
    telephone: siteContacts.phone,
    email: siteContacts.email,
    address: parsePostalAddress(siteContacts.address),
    sameAs: siteSocials.map((social) => social.url),
  };
}

export function StructuredData() {
  const jsonLd = buildOrganizationLd();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
