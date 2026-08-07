import {
  forwardRef,
  type ChangeEventHandler,
  type FocusEventHandler,
  type SelectHTMLAttributes,
} from 'react';

import './Field.css';

const TIPO_PROJETO_OPTIONS = [
  { value: 'reforma_residencial', label: 'reforma residencial' },
  { value: 'reforma_comercial', label: 'reforma comercial' },
  { value: 'construcao_residencial', label: 'construção residencial' },
  { value: 'construcao_corporativa', label: 'construção corporativa' },
  { value: 'projeto_interiores', label: 'projeto de interiores' },
] as const;

export type SelectFieldProps = {
  id: string;
  label: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  onBlur?: FocusEventHandler<HTMLSelectElement>;
  error?: string;
  name?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'value' | 'onChange' | 'onBlur' | 'name'>;

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField({ id, label, value, onChange, onBlur, error, name, ...rest }, ref) {
    const errorId = `${id}-error`;
    const describedBy = error ? errorId : undefined;
    const hasValue = Boolean(value && String(value).length > 0);
    const controlClassName = [
      'lead-field__control',
      hasValue ? 'lead-field__control--has-value' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={['lead-field', error ? 'lead-field--error' : ''].filter(Boolean).join(' ')}>
        <select
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={controlClassName}
          {...rest}
        >
          <option value="" disabled hidden />
          {TIPO_PROJETO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label htmlFor={id} className="lead-field__label">
          {label}
        </label>
        {error ? (
          <p id={errorId} className="lead-field__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
