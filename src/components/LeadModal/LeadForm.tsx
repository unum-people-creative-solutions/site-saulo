'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { leadSchema, type LeadFormData } from '@/lib/lead-schema';

import { Field } from './Field';
import { SelectField } from './SelectField';
import './LeadForm.css';

export type LeadFormProps = {
  onValid?: (data: LeadFormData) => void;
  onInvalid?: () => void;
  /** When true, hides the built-in submit — parent renders final CTAs. */
  hideSubmit?: boolean;
};

export function LeadForm({ onValid, onInvalid, hideSubmit = false }: LeadFormProps) {
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
        (data) => onValid?.(data),
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

      {hideSubmit ? null : (
        <button type="submit" className="lead-form__submit">
          enviar formulário
        </button>
      )}
    </form>
  );
}
