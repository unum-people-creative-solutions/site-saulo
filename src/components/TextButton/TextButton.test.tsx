import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextButton } from './TextButton';

describe('TextButton', () => {
  it('T02: renders button with onClick and link with href', () => {
    const { rerender } = render(
      <TextButton onClick={() => undefined}>rótulo</TextButton>,
    );

    expect(screen.getByRole('button', { name: 'rótulo' })).toBeInTheDocument();

    rerender(<TextButton href="#sobre">rótulo</TextButton>);

    expect(screen.getByRole('link', { name: 'rótulo' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('T03: disabled button does not call onClick and exposes disabled state', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <TextButton onClick={onClick} disabled>
        rótulo
      </TextButton>,
    );

    const button = screen.getByRole('button', { name: 'rótulo' });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
