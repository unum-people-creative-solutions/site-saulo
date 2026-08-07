import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WhatsAppFab } from './WhatsAppFab';

const openModal = vi.fn();

vi.mock('@/context/LeadContext', () => ({
  useLead: () => ({
    openModal,
    closeModal: vi.fn(),
    isModalOpen: false,
    params: {},
    origem: 'organico',
  }),
}));

describe('WhatsAppFab', () => {
  beforeEach(() => {
    openModal.mockClear();
  });

  it('exposes accessible button name and never links to wa.me', () => {
    const { container } = render(<WhatsAppFab />);

    expect(
      screen.getByRole('button', { name: 'Falar sobre um projeto' }),
    ).toBeInTheDocument();

    expect(container.innerHTML).not.toContain('wa.me');
  });

  it('T29: click calls openModal and does not render wa.me href', async () => {
    const user = userEvent.setup();
    const { container } = render(<WhatsAppFab />);

    await user.click(
      screen.getByRole('button', { name: 'Falar sobre um projeto' }),
    );

    expect(openModal).toHaveBeenCalledTimes(1);
    expect(container.innerHTML).not.toContain('wa.me');
    expect(container.querySelector('a[href*="wa.me"]')).toBeNull();
  });
});
