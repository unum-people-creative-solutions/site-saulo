import { render, screen } from '@testing-library/react';

import { Field } from './Field';

describe('Field', () => {
  it('associates label via getByLabelText', () => {
    render(<Field id="nome" label="nome" value="" onChange={() => undefined} onBlur={() => undefined} />);

    expect(screen.getByLabelText('nome')).toBeInTheDocument();
  });

  it('exposes error text with aria-describedby', () => {
    render(
      <Field
        id="nome"
        label="nome"
        value=""
        onChange={() => undefined}
        onBlur={() => undefined}
        error="Campo obrigatório"
      />,
    );

    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    expect(screen.getByLabelText('nome')).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('nome'),
    );
  });
});
