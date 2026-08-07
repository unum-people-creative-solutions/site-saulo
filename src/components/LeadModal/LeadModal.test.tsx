import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LeadProvider, useLead } from '@/context/LeadContext';

import { LeadModal } from './LeadModal';

function OpenTrigger() {
  const { openModal, isModalOpen } = useLead();
  return (
    <button type="button" onClick={openModal}>
      {isModalOpen ? 'modal-open' : 'abrir modal'}
    </button>
  );
}

function renderModal() {
  return render(
    <LeadProvider>
      <OpenTrigger />
      <LeadModal />
    </LeadProvider>,
  );
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('nome'), 'Maria Silva');
  await user.type(screen.getByLabelText('telefone / whatsapp'), '11999999999');
  await user.type(screen.getByLabelText('e-mail'), 'maria@example.com');
  await user.selectOptions(
    screen.getByLabelText('tipo de projeto'),
    'reforma_residencial',
  );
  await user.type(screen.getByLabelText('conte um pouco sobre'), 'Quero reformar');
}

async function validateAndGetActions(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /enviar formulário/i }));

  const actions = await screen.findByRole('group', { name: /ações de envio/i });
  return actions;
}

describe('LeadModal', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('T23: valid form + enviar formulário shows success panel', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'abrir modal' }));
    expect(
      screen.getByRole('heading', { name: 'Vamos falar de arquitetura' }),
    ).toBeInTheDocument();

    await fillValidForm(user);
    const actions = await validateAndGetActions(user);

    await user.click(
      within(actions).getByRole('button', { name: /enviar formulário/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          'Recebemos sua mensagem! Entraremos em contato em até 24 horas.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('T26: API 500 shows error, keeps field values, button stays clickable', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      }),
    );

    renderModal();

    await user.click(screen.getByRole('button', { name: 'abrir modal' }));
    await fillValidForm(user);
    const actions = await validateAndGetActions(user);

    await user.click(
      within(actions).getByRole('button', { name: /enviar formulário/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/não foi possível|erro|tente/i);
    });

    expect(screen.getByLabelText('nome')).toHaveValue('Maria Silva');
    expect(screen.getByLabelText('e-mail')).toHaveValue('maria@example.com');

    const retryActions = screen.getByRole('group', { name: /ações de envio/i });
    const retryButton = within(retryActions).getByRole('button', {
      name: /enviar formulário/i,
    });
    expect(retryButton).toBeEnabled();
  });

  it('T28: Esc closes the modal and restores focus to the trigger', async () => {
    const user = userEvent.setup();
    renderModal();

    const trigger = screen.getByRole('button', { name: 'abrir modal' });
    await user.click(trigger);
    expect(screen.getByText('modal-open')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Vamos falar de arquitetura' }),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Vamos falar de arquitetura' }),
      ).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'abrir modal' })).toHaveFocus();
    });
  });

  it('close button dismisses the form and restores focus to the trigger', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'abrir modal' }));
    expect(
      screen.getByRole('heading', { name: 'Vamos falar de arquitetura' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fechar formulário' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Vamos falar de arquitetura' }),
      ).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'abrir modal' })).toHaveFocus();
    });
  });
});
