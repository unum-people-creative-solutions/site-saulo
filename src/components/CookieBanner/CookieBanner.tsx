'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import './CookieBanner.css';

const CONSENT_KEY = 'saulo:cookie-consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
  }

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'true');
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      className="cookie-banner"
      role="region"
      aria-labelledby="cookie-banner-title"
    >
      <div className="cookie-banner__header">
        <h2 id="cookie-banner-title" className="cookie-banner__title">
          Configuração de Cookies
        </h2>
        <button
          type="button"
          className="cookie-banner__close"
          aria-label="Fechar aviso de cookies"
          onClick={dismiss}
        >
          <X strokeWidth={1.25} aria-hidden="true" />
        </button>
      </div>
      <p className="cookie-banner__text">
        Usamos cookies essenciais para o funcionamento do site. Nenhum dado
        pessoal é armazenado neste consentimento.
      </p>
      <div className="cookie-banner__actions">
        <button
          type="button"
          className="cookie-banner__button cookie-banner__button--primary"
          onClick={accept}
        >
          Aceitar
        </button>
        <button
          type="button"
          className="cookie-banner__button"
          onClick={dismiss}
        >
          Configurar
        </button>
      </div>
    </div>
  );
}
