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

    const instagram = screen.getByRole('link', {
      name: /instagram.*@saulomagno\.arquitetos/i,
    });
    expect(instagram).toHaveClass('footer-section__split-row');
    expect(instagram).toHaveAttribute(
      'href',
      'https://www.instagram.com/saulomagno.arquitetos',
    );
    expect(instagram.getAttribute('rel')).toMatch(/noopener/);
    expect(instagram.getAttribute('rel')).toMatch(/noreferrer/);
    expect(
      instagram.querySelector('.footer-section__split-desc'),
    ).toHaveTextContent('Instagram');
    expect(
      instagram.querySelector('.footer-section__split-value'),
    ).toHaveTextContent('@saulomagno.arquitetos');

    const pinterest = screen.getByRole('link', {
      name: /pinterest.*@saulomagno_/i,
    });
    expect(pinterest).toHaveClass('footer-section__split-row');
    expect(pinterest).toHaveAttribute(
      'href',
      'https://br.pinterest.com/saulomagno_',
    );
    expect(pinterest.getAttribute('rel')).toMatch(/noopener/);
    expect(pinterest.getAttribute('rel')).toMatch(/noreferrer/);
    expect(
      pinterest.querySelector('.footer-section__split-desc'),
    ).toHaveTextContent('Pinterest');
    expect(
      pinterest.querySelector('.footer-section__split-value'),
    ).toHaveTextContent('@saulomagno_');

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

    const phone = screen.getByRole('link', { name: /telefone.*\+55/i });
    expect(phone).toHaveClass('footer-section__split-row');
    expect(phone.getAttribute('href')).toMatch(/^tel:/);
    expect(phone.querySelector('.footer-section__split-desc')).toHaveTextContent(
      'Telefone',
    );
    expect(phone.querySelector('.footer-section__split-value')).toHaveTextContent(
      '+55 11 98286 4003',
    );

    const email = screen.getByRole('link', {
      name: /e-mail.*arquitetura@sauloarq\.com/i,
    });
    expect(email).toHaveClass('footer-section__split-row');
    expect(email).toHaveAttribute('href', 'mailto:arquitetura@sauloarq.com');
    expect(email.querySelector('.footer-section__split-desc')).toHaveTextContent(
      'E-mail',
    );
    expect(email.querySelector('.footer-section__split-value')).toHaveTextContent(
      'arquitetura@sauloarq.com',
    );
  });

  it('address opens Google Maps in a new tab with the full query', () => {
    render(<FooterSection />);

    const address = screen.getByRole('link', {
      name: /Rua Fernando Falcão/i,
    });
    expect(address).toHaveAttribute(
      'href',
      expect.stringMatching(
        /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/,
      ),
    );
    expect(address.getAttribute('href')).toContain(
      encodeURIComponent('Rua Fernando Falcão'),
    );
    expect(address).toHaveAttribute('target', '_blank');
    expect(address.getAttribute('rel')).toMatch(/noopener/);
    expect(address.getAttribute('rel')).toMatch(/noreferrer/);

    const lines = address.querySelectorAll('.footer-section__address-line');
    expect([...lines].map((el) => el.textContent)).toEqual([
      'Rua Fernando Falcão, 1111 — Mooca',
      'Sala 407 — Ed. Bernini',
      'São Paulo-SP',
      '03180-003',
    ]);
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
