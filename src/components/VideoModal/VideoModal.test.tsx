import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { VideoModal } from './VideoModal';

describe('VideoModal', () => {
  it('shows coming-soon content when open and closes via Esc or close button', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    const { rerender } = render(
      <VideoModal open={true} onOpenChange={onOpenChange} />,
    );

    expect(
      screen.getByText(
        'O vídeo explicando nosso processo está em produção — volte em breve.',
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    onOpenChange.mockClear();
    rerender(<VideoModal open={true} onOpenChange={onOpenChange} />);

    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
