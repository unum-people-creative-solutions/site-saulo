import { render, screen } from '@testing-library/react';

import { SelectField } from './SelectField';

describe('SelectField', () => {
  it('associates label and exposes the 5 project-type options', () => {
    render(
      <SelectField
        id="tipoProjeto"
        label="tipo de projeto"
        value=""
        onChange={() => undefined}
        onBlur={() => undefined}
      />,
    );

    const select = screen.getByLabelText('tipo de projeto');
    expect(select).toBeInTheDocument();
    expect(select.tagName).toBe('SELECT');

    const options = Array.from(select.querySelectorAll('option')).map((o) => ({
      value: o.value,
      text: o.textContent?.trim(),
    }));

    expect(options).toEqual(
      expect.arrayContaining([
        { value: 'reforma_residencial', text: 'reforma residencial' },
        { value: 'reforma_comercial', text: 'reforma comercial' },
        { value: 'construcao_residencial', text: 'construção residencial' },
        { value: 'construcao_corporativa', text: 'construção corporativa' },
        { value: 'projeto_interiores', text: 'projeto de interiores' },
      ]),
    );
    expect(
      options.filter((o) => o.value !== '').length,
    ).toBe(5);
  });
});
