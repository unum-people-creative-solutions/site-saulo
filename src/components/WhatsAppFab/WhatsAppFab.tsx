'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { useLead } from '@/context/LeadContext';
import './WhatsAppFab.css';

export function WhatsAppFab() {
  const { openModal } = useLead();

  return (
    <button
      type="button"
      className="whatsapp-fab"
      aria-label="Falar sobre um projeto"
      onClick={openModal}
    >
      <FaWhatsapp className="whatsapp-fab__icon" aria-hidden="true" />
    </button>
  );
}
