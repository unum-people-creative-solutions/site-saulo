import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FooterSection } from './FooterSection';

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

describe('FooterSection', () => {
  beforeEach(() => {
    openModal.mockClear();
  });

  it('T16: Instagram and Pinterest links use confirmed URLs with safe rel; no LinkedIn', () => {
    render(<FooterSection />);

    const instagram = screen.getByRole('link', { name: /instagram/i });
    expect(instagram).toHaveAttribute(
      'href',
      'https://www.instagram.com/saulomagno.arquitetos',
    );
    expect(instagram.getAttribute('rel')).toMatch(/noopener/);
    expect(instagram.getAttribute('rel')).toMatch(/noreferrer/);

    const pinterest = screen.getByRole('link', { name: /pinterest/i });
    expect(pinterest).toHaveAttribute(
      'href',
      'https://br.pinterest.com/saulomagno_',
    );
    expect(pinterest.getAttribute('rel')).toMatch(/noopener/);
    expect(pinterest.getAttribute('rel')).toMatch(/noreferrer/);

    expect(screen.queryByText(/linkedin/i)).toBeNull();
  });

  it('T17: nav anchors point to #sobre, #processo, #galeria', () => {
    render(<FooterSection />);

    expect(screen.getByRole('link', { name: 'SOBRE' })).toHaveAttribute(
      'href',
      '#sobre',
    );
    expect(screen.getByRole('link', { name: 'PROCESSO' })).toHaveAttribute(
      'href',
      '#processo',
    );
    expect(screen.getByRole('link', { name: 'GALERIA' })).toHaveAttribute(
      'href',
      '#galeria',
    );

    expect(screen.queryByText('Navegação')).toBeNull();
    expect(
      screen.getByRole('navigation', { name: 'Navegação' }),
    ).toBeInTheDocument();
  });

  it('T18: phone uses tel: and email uses mailto:arquitetura@sauloarq.com', () => {
    render(<FooterSection />);

    const phone = screen.getByRole('link', { name: /\+55/ });
    expect(phone.getAttribute('href')).toMatch(/^tel:/);

    const email = screen.getByRole('link', {
      name: 'arquitetura@sauloarq.com',
    });
    expect(email).toHaveAttribute('href', 'mailto:arquitetura@sauloarq.com');
  });

  it('T29: CTA calls openModal and does not render wa.me href', async () => {
    const user = userEvent.setup();
    const { container } = render(<FooterSection />);

    await user.click(
      screen.getByRole('button', { name: 'Iniciar um contato.' }),
    );

    expect(openModal).toHaveBeenCalledTimes(1);
    expect(container.innerHTML).not.toContain('wa.me');
    expect(container.querySelector('a[href*="wa.me"]')).toBeNull();
  });
});
