import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { captureTrackingParams, resolveOrigem } from './tracking';

function setSearch(search: string) {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, search },
    writable: true,
    configurable: true,
  });
}

describe('captureTrackingParams', () => {
  beforeEach(() => {
    setSearch('');
  });

  afterEach(() => {
    setSearch('');
  });

  it('reads gclid, fbclid and utm_* from window.location.search', () => {
    setSearch(
      '?gclid=g1&fbclid=f1&utm_source=google&utm_medium=cpc&utm_campaign=brand',
    );

    expect(captureTrackingParams()).toEqual({
      gclid: 'g1',
      fbclid: 'f1',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'brand',
    });
  });

  it('returns undefined for absent params, never empty string', () => {
    setSearch('?gclid=only-gclid');

    const params = captureTrackingParams();

    expect(params.gclid).toBe('only-gclid');
    expect(params.fbclid).toBeUndefined();
    expect(params.utm_source).toBeUndefined();
    expect(params.utm_medium).toBeUndefined();
    expect(params.utm_campaign).toBeUndefined();
    expect(Object.values(params).every((v) => v !== '')).toBe(true);
  });
});

describe('resolveOrigem (T04)', () => {
  it.each([
    {
      name: 'gclid → Google Ads',
      params: { gclid: 'abc' },
      expected: 'Google Ads',
    },
    {
      name: 'fbclid sem gclid → Meta Ads',
      params: { fbclid: 'xyz' },
      expected: 'Meta Ads',
    },
    {
      name: 'apenas utm_source → valor do source',
      params: { utm_source: 'x' },
      expected: 'x',
    },
    {
      name: 'sem parâmetros → Direto',
      params: {},
      expected: 'Direto',
    },
  ])('$name', ({ params, expected }) => {
    const origem = resolveOrigem(params);
    expect(origem).toContain('Site Saulo Magno');
    expect(origem).toContain(expected);
  });

  it('gclid tem precedência sobre fbclid', () => {
    const origem = resolveOrigem({ gclid: 'g1', fbclid: 'f1' });
    expect(origem).toContain('Google Ads');
    expect(origem).not.toContain('Meta Ads');
  });
});
