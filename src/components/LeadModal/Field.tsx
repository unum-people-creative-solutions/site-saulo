import {
  forwardRef,
  type ChangeEvent,
  type ChangeEventHandler,
  type FocusEventHandler,
  type InputHTMLAttributes,
} from 'react';
import { IMaskInput } from 'react-imask';

import './Field.css';

export type FieldProps = {
  id: string;
  label: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  error?: string;
  type?: InputHTMLAttributes<HTMLInputElement>['type'];
  name?: string;
  mask?: string;
};

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { id, label, value, onChange, onBlur, error, type = 'text', name, mask },
  ref,
) {
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : undefined;
  const hasValue = Boolean(value && String(value).length > 0);
  const controlClassName = [
    'lead-field__control',
    hasValue ? 'lead-field__control--has-value' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const emitChange = (next: string) => {
    if (!onChange) return;
    const event = {
      target: { value: next, name: name ?? id },
      currentTarget: { value: next, name: name ?? id },
      type: 'change',
    } as ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  return (
    <div className={['lead-field', error ? 'lead-field--error' : ''].filter(Boolean).join(' ')}>
      {mask ? (
        <IMaskInput
          id={id}
          name={name}
          mask={mask}
          value={value ?? ''}
          unmask
          inputRef={ref}
          onAccept={(next: string) => emitChange(next)}
          onBlur={onBlur}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={controlClassName}
          placeholder=" "
        />
      ) : (
        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={controlClassName}
          placeholder=" "
        />
      )}
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
});
