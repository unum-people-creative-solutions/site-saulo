import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LeadForm } from './LeadForm';

describe('LeadForm', () => {
  it('T20: empty submit does not call onEmailSubmit and announces errors in aria-live', async () => {
    const user = userEvent.setup();
    const onEmailSubmit = vi.fn();

    render(<LeadForm onEmailSubmit={onEmailSubmit} />);

    await user.click(screen.getByRole('button', { name: /enviar formulário/i }));

    expect(onEmailSubmit).not.toHaveBeenCalled();

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

  it('shows both email and WhatsApp CTAs from the start', () => {
    render(<LeadForm />);

    const actions = screen.getByRole('group', { name: /ações de envio/i });
    expect(
      within(actions).getByRole('button', { name: /enviar formulário/i }),
    ).toBeInTheDocument();
    expect(
      within(actions).getByRole('button', { name: /falar agora no WhatsApp/i }),
    ).toBeInTheDocument();
  });

  it('T22: phone with fewer than 10 digits blocks submit with specific error', async () => {
    const user = userEvent.setup();
    const onEmailSubmit = vi.fn();

    render(<LeadForm onEmailSubmit={onEmailSubmit} />);

    await user.type(screen.getByLabelText('nome'), 'Maria Silva');
    await user.type(screen.getByLabelText('telefone / whatsapp'), '119999999');
    await user.type(screen.getByLabelText('e-mail'), 'maria@example.com');
    await user.selectOptions(screen.getByLabelText('tipo de projeto'), 'reforma_residencial');
    await user.type(screen.getByLabelText('conte um pouco sobre'), 'Quero reformar');

    await user.click(screen.getByRole('button', { name: /enviar formulário/i }));

    expect(onEmailSubmit).not.toHaveBeenCalled();
    expect(screen.getAllByText('Telefone inválido').length).toBeGreaterThanOrEqual(1);
  });

  it('WhatsApp CTA validates and calls onWhatsAppSubmit with form data', async () => {
    const user = userEvent.setup();
    const onWhatsAppSubmit = vi.fn();
    const onEmailSubmit = vi.fn();

    render(
      <LeadForm
        onEmailSubmit={onEmailSubmit}
        onWhatsAppSubmit={onWhatsAppSubmit}
      />,
    );

    await user.type(screen.getByLabelText('nome'), 'Maria Silva');
    await user.type(screen.getByLabelText('telefone / whatsapp'), '11999999999');
    await user.type(screen.getByLabelText('e-mail'), 'maria@example.com');
    await user.selectOptions(
      screen.getByLabelText('tipo de projeto'),
      'reforma_residencial',
    );

    await user.click(
      screen.getByRole('button', { name: /falar agora no WhatsApp/i }),
    );

    expect(onEmailSubmit).not.toHaveBeenCalled();
    expect(onWhatsAppSubmit).toHaveBeenCalledOnce();
    expect(onWhatsAppSubmit.mock.calls[0]?.[0]).toMatchObject({
      nome: 'Maria Silva',
      email: 'maria@example.com',
      tipoProjeto: 'reforma_residencial',
    });
  });
});
