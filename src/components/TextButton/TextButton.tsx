import type { ReactNode } from 'react';
import './TextButton.css';

type TextButtonVariant = 'onDark' | 'onLight';

type TextButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  variant?: TextButtonVariant;
};

export function TextButton({
  children,
  onClick,
  href,
  disabled = false,
  variant = 'onLight',
}: TextButtonProps) {
  const className = `text-button text-button--${variant}`;

  if (href !== undefined) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
