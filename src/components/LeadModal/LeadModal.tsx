'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { useLead } from '@/context/LeadContext';
import type { LeadFormData } from '@/lib/lead-schema';
import { submitLead } from '@/lib/submit-lead';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

import { LeadForm } from './LeadForm';
import { SuccessPanel } from './SuccessPanel';
import './LeadModal.css';

type ModalStatus = 'form' | 'submitting' | 'success' | 'error';

export function LeadModal() {
  const { isModalOpen, closeModal, origem, params, restoreTriggerFocus } =
    useLead();
  const [status, setStatus] = useState<ModalStatus>('form');

  function resetLocalState() {
    setStatus('form');
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      closeModal();
      resetLocalState();
    }
  }

  function buildPayload(data: LeadFormData) {
    return {
      ...data,
      origem,
      gclid: params.gclid,
      utm_source: params.utm_source,
      utm_medium: params.utm_medium,
      utm_campaign: params.utm_campaign,
    };
  }

  async function handleEmailSubmit(data: LeadFormData) {
    setStatus('submitting');
    try {
      await submitLead(buildPayload(data), 'email');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  async function handleWhatsAppSubmit(data: LeadFormData) {
    setStatus('submitting');
    await submitLead(buildPayload(data), 'whatsapp');
    window.location.href = buildWhatsAppUrl(data);
  }

  const showForm = status === 'form' || status === 'submitting' || status === 'error';
  const busy = status === 'submitting';

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="lead-modal__overlay" />
        <Dialog.Content
          className="lead-modal__content"
          aria-describedby={undefined}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            restoreTriggerFocus();
          }}
        >
          <Dialog.Close
            type="button"
            className="lead-modal__close"
            aria-label="Fechar formulário"
          >
            <X strokeWidth={1.25} aria-hidden="true" />
          </Dialog.Close>

          <Dialog.Title className="lead-modal__title">
            Vamos falar de arquitetura
          </Dialog.Title>

          {status === 'success' ? (
            <SuccessPanel onClose={() => handleOpenChange(false)} />
          ) : null}

          {showForm ? (
            <>
              <LeadForm
                onEmailSubmit={handleEmailSubmit}
                onWhatsAppSubmit={handleWhatsAppSubmit}
                onInvalid={() => {
                  /* validation errors stay in the form */
                }}
                busy={busy}
              />

              {status === 'error' ? (
                <p className="lead-modal__error" role="alert">
                  Não foi possível enviar. Tente de novo.
                </p>
              ) : null}
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
