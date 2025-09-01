
import { render, screen, fireEvent } from '@/test/utils';
import { InteractiveButton, FloatingActionButton, PulseIndicator } from '../micro-interactions';

// Mock useAppStore
jest.mock('@/stores/appStore', () => ({
  useAppStore: () => ({
    triggerHapticFeedback: jest.fn(),
    handleTouchInteraction: jest.fn(),
  }),
}));

describe('InteractiveButton', () => {
  it('renders and handles click', () => {
    const handleClick = jest.fn();
    render(<InteractiveButton onClick={handleClick}>Test Button</InteractiveButton>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies different variants', () => {
    const { rerender } = render(<InteractiveButton variant="ghost">Ghost</InteractiveButton>);
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');

    rerender(<InteractiveButton variant="outline">Outline</InteractiveButton>);
    expect(screen.getByRole('button')).toHaveClass('border');
  });

  it('does not trigger click when disabled', () => {
    const handleClick = jest.fn();
    render(<InteractiveButton onClick={handleClick} disabled>Disabled</InteractiveButton>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('FloatingActionButton', () => {
  it('renders with children and handles click', () => {
    const handleClick = jest.fn();
    render(
      <FloatingActionButton onClick={handleClick}>
        <span>FAB</span>
      </FloatingActionButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('PulseIndicator', () => {
  it('renders with different sizes', () => {
    const { rerender } = render(<PulseIndicator size="sm" />);
    expect(document.querySelector('.w-2')).toBeInTheDocument();

    rerender(<PulseIndicator size="lg" />);
    expect(document.querySelector('.w-4')).toBeInTheDocument();
  });
});
