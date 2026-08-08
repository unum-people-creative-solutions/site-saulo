export const siteAddressLines = [
  'Rua Fernando Falcão, 1111 — Mooca',
  'Sala 407 — Ed. Bernini',
  'São Paulo-SP',
  '03180-003',
] as const;

export const siteContacts = {
  phone: '+55 11 98286 4003',
  email: 'arquitetura@sauloarq.com',
  addressLines: siteAddressLines,
  /** Single-line form for maps query / JSON-LD parsing. */
  address: siteAddressLines.join(', '),
};

/** Digits-only office number for `wa.me` (public contact). */
export const siteWhatsAppNumber = siteContacts.phone.replace(/\D/g, '');

export const siteSocials = [
  {
    name: 'Instagram',
    handle: '@saulomagno.arquitetos',
    url: 'https://www.instagram.com/saulomagno.arquitetos',
  },
  {
    name: 'Pinterest',
    handle: '@saulomagno_',
    url: 'https://br.pinterest.com/saulomagno_',
  },
];

/** Domínio de produção ainda pendente do cliente — override via NEXT_PUBLIC_SITE_URL */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sauloarq.com'
).replace(/\/$/, '');

export const siteName = 'Saulo Magno Arquitetos';

export const siteTitle =
  'Saulo Magno Arquitetos — Arquitetura e Interiores';

export const siteDescription =
  'Escritório de arquitetura e interiores em São Paulo, com projetos residenciais e comerciais conduzidos com atenção ao processo e ao detalhe.';

/** Placeholder — copy real ainda não veio do cliente */
export const siteHeroText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.';

/** Placeholder — 4 blocos até copy real do cliente */
export const siteAboutBlocks = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
];
