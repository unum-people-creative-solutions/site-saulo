'use client';

import { useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { leadSchema, type LeadFormData } from '@/lib/lead-schema';

import { Field } from './Field';
import { SelectField } from './SelectField';
import './LeadForm.css';

export type LeadFormProps = {
  onEmailSubmit?: (data: LeadFormData) => void;
  onWhatsAppSubmit?: (data: LeadFormData) => void;
  onInvalid?: () => void;
  busy?: boolean;
};

export function LeadForm({
  onEmailSubmit,
  onWhatsAppSubmit,
  onInvalid,
  busy = false,
}: LeadFormProps) {
  const submitModeRef = useRef<'email' | 'whatsapp'>('email');
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      nome: '',
      telefone: '',
      email: '',
      mensagem: '',
    },
  });

  const liveMessages = [
    errors.nome?.message,
    errors.telefone?.message,
    errors.email?.message,
    errors.tipoProjeto?.message,
    errors.mensagem?.message,
  ].filter(Boolean) as string[];

  return (
    <form
      className="lead-form"
      noValidate
      onSubmit={handleSubmit(
        (data) => {
          if (submitModeRef.current === 'whatsapp') {
            onWhatsAppSubmit?.(data);
          } else {
            onEmailSubmit?.(data);
          }
        },
        () => onInvalid?.(),
      )}
    >
      <Field
        id="nome"
        label="nome"
        type="text"
        error={errors.nome?.message}
        {...register('nome')}
      />

      <Controller
        name="telefone"
        control={control}
        render={({ field }) => (
          <Field
            id="telefone"
            label="telefone / whatsapp"
            name={field.name}
            value={field.value ?? ''}
            onBlur={field.onBlur}
            onChange={(event) => field.onChange(event.target.value)}
            mask="(00) 00000-0000"
            error={errors.telefone?.message}
            ref={field.ref}
          />
        )}
      />

      <Field
        id="email"
        label="e-mail"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Controller
        name="tipoProjeto"
        control={control}
        render={({ field }) => (
          <SelectField
            id="tipoProjeto"
            label="tipo de projeto"
            name={field.name}
            value={field.value ?? ''}
            onBlur={field.onBlur}
            onChange={field.onChange}
            error={errors.tipoProjeto?.message}
            ref={field.ref}
          />
        )}
      />

      <div className="lead-form__textarea-wrap">
        <textarea
          id="mensagem"
          className="lead-form__textarea"
          placeholder=" "
          aria-invalid={errors.mensagem ? true : undefined}
          aria-describedby={errors.mensagem ? 'mensagem-error' : undefined}
          {...register('mensagem')}
        />
        <label htmlFor="mensagem" className="lead-form__textarea-label">
          conte um pouco sobre
        </label>
        {errors.mensagem?.message ? (
          <p id="mensagem-error" className="lead-field__error" role="alert">
            {errors.mensagem.message}
          </p>
        ) : null}
      </div>

      <div className="lead-form__live" aria-live="polite">
        {liveMessages.join(' · ')}
      </div>

      <div
        className="lead-form__actions"
        role="group"
        aria-label="ações de envio"
      >
        <button
          type="submit"
          className="lead-form__submit"
          disabled={busy}
          onClick={() => {
            submitModeRef.current = 'email';
          }}
        >
          enviar formulário
        </button>
        <button
          type="submit"
          className="lead-form__submit"
          disabled={busy}
          onClick={() => {
            submitModeRef.current = 'whatsapp';
          }}
        >
          falar agora no WhatsApp
        </button>
      </div>
    </form>
  );
}
