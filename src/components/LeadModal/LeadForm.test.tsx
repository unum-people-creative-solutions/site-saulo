import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LeadForm } from './LeadForm';

describe('LeadForm', () => {
  it('T20: empty submit does not call onValid and announces errors in aria-live', async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();

    render(<LeadForm onValid={onValid} />);

    await user.click(screen.getByRole('button', { name: /enviar formulário/i }));

    expect(onValid).not.toHaveBeenCalled();

    const live = document.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
    expect(within(live as HTMLElement).getByText(/obrigatório|inválido|informe/i)).toBeInTheDocument();
  });

  it('T21: every field is found by getByLabelText', () => {
    render(<LeadForm />);

    expect(screen.getByLabelText('nome')).toBeInTheDocument();
    expect(screen.getByLabelText('telefone / whatsapp')).toBeInTheDocument();
    expect(screen.getByLabelText('e-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('tipo de projeto')).toBeInTheDocument();
    expect(screen.getByLabelText('conte um pouco sobre')).toBeInTheDocument();
  });

  it('T22: phone with fewer than 10 digits blocks submit with specific error', async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();

    render(<LeadForm onValid={onValid} />);

    await user.type(screen.getByLabelText('nome'), 'Maria Silva');
    await user.type(screen.getByLabelText('telefone / whatsapp'), '119999999');
    await user.type(screen.getByLabelText('e-mail'), 'maria@example.com');
    await user.selectOptions(screen.getByLabelText('tipo de projeto'), 'reforma_residencial');
    await user.type(screen.getByLabelText('conte um pouco sobre'), 'Quero reformar');

    await user.click(screen.getByRole('button', { name: /enviar formulário/i }));

    expect(onValid).not.toHaveBeenCalled();
    expect(screen.getAllByText('Telefone inválido').length).toBeGreaterThanOrEqual(1);
  });
});

