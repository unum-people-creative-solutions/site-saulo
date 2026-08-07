export type TrackingParams = {
  gclid?: string;
  fbclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

const PARAM_KEYS = [
  'gclid',
  'fbclid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
] as const;

export function captureTrackingParams(): TrackingParams {
  const search = new URLSearchParams(window.location.search);
  const params: TrackingParams = {};

  for (const key of PARAM_KEYS) {
    const value = search.get(key);
    if (value) {
      params[key] = value;
    }
  }

  return params;
}

const ORIGEM_PREFIX = 'Site Saulo Magno';

export function resolveOrigem(params: TrackingParams): string {
  let source: string;

  if (params.gclid) {
    source = 'Google Ads';
  } else if (params.fbclid) {
    source = 'Meta Ads';
  } else if (params.utm_source) {
    source = params.utm_source;
  } else if (typeof document !== 'undefined' && document.referrer) {
    source = document.referrer;
  } else {
    source = 'Direto/Orgânico';
  }

  return `${ORIGEM_PREFIX} | ${source}`;
}
