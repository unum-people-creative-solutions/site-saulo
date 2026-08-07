import { fireEvent, render, screen } from '@testing-library/react';
import { ScrollCue } from './ScrollCue';

describe('ScrollCue', () => {
  it('renders and disappears after the first window scroll', () => {
    render(<ScrollCue />);

    expect(screen.getByText('(scroll down)')).toBeInTheDocument();

    fireEvent.scroll(window);

    expect(screen.queryByText('(scroll down)')).not.toBeInTheDocument();
  });
});
