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
  const [validatedData, setValidatedData] = useState<LeadFormData | null>(null);

  function resetLocalState() {
    setStatus('form');
    setValidatedData(null);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      closeModal();
      resetLocalState();
    }
  }

  function handleValid(data: LeadFormData) {
    setValidatedData(data);
    setStatus('form');
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

  async function handleEmailSubmit() {
    if (!validatedData) return;

    setStatus('submitting');
    try {
      await submitLead(buildPayload(validatedData), 'email');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  async function handleWhatsAppSubmit() {
    if (!validatedData) return;

    setStatus('submitting');
    await submitLead(buildPayload(validatedData), 'whatsapp');
    window.location.href = buildWhatsAppUrl(validatedData);
  }

  const showForm = status === 'form' || status === 'submitting' || status === 'error';
  const showActions = Boolean(validatedData) && status !== 'success';
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
                onValid={handleValid}
                onInvalid={() => {
                  /* validation errors stay in the form */
                }}
                hideSubmit={Boolean(validatedData)}
              />

              {status === 'error' ? (
                <p className="lead-modal__error" role="alert">
                  Não foi possível enviar. Tente de novo.
                </p>
              ) : null}

              {showActions ? (
                <div
                  className="lead-modal__actions"
                  role="group"
                  aria-label="ações de envio"
                >
                  <button
                    type="button"
                    className="lead-modal__action"
                    disabled={busy}
                    onClick={handleEmailSubmit}
                  >
                    enviar formulário
                  </button>
                  <button
                    type="button"
                    className="lead-modal__action"
                    disabled={busy}
                    onClick={handleWhatsAppSubmit}
                  >
                    falar agora no WhatsApp
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
