import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProcessSection } from './ProcessSection';

const videoModalProps = vi.fn();

vi.mock('@/components/VideoModal/VideoModal', () => ({
  VideoModal: (props: { open: boolean; onOpenChange: (open: boolean) => void }) => {
    videoModalProps(props);
    if (!props.open) return null;
    return <div role="dialog" aria-label="Vídeo do processo" />;
  },
}));

describe('ProcessSection', () => {
  beforeEach(() => {
    videoModalProps.mockClear();
  });

  it('T12: renders four process act headings in order with accessible indices', () => {
    render(<ProcessSection />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      'RECONHECIMENTO',
      'CONCEPÇÃO',
      'ALINHAMENTO',
      'IMPLANTAÇÃO',
    ]);

    expect(screen.getByText('Ato 1 de 4')).toBeInTheDocument();
    expect(screen.getByText('Ato 2 de 4')).toBeInTheDocument();
    expect(screen.getByText('Ato 3 de 4')).toBeInTheDocument();
    expect(screen.getByText('Ato 4 de 4')).toBeInTheDocument();
  });

  it('renders scrim between background and content', () => {
    const { container } = render(<ProcessSection />);

    expect(container.querySelector('.process-section__scrim')).not.toBeNull();
  });

  it('T29: CTA opens VideoModal and does not render wa.me href', async () => {
    const user = userEvent.setup();
    const { container } = render(<ProcessSection />);

    await user.click(
      screen.getByRole('button', {
        name: 'QUERO ENTENDER MELHOR O PROCESSO',
      }),
    );

    expect(screen.getByRole('dialog', { name: 'Vídeo do processo' })).toBeInTheDocument();
    expect(videoModalProps).toHaveBeenCalledWith(
      expect.objectContaining({ open: true }),
    );
    expect(container.innerHTML).not.toContain('wa.me');
    expect(container.querySelector('a[href*="wa.me"]')).toBeNull();
  });
});
