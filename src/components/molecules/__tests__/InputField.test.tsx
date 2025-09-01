
import { render, screen, fireEvent } from '@/test/utils';
import { InputField } from '../InputField';

describe('InputField Component', () => {
  it('renders input with label', () => {
    render(<InputField label="Test Label" />);
    expect(screen.getByLabelText(/test label/i)).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<InputField label="Test" error="This field is required" />);
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
  });

  it('displays description when provided', () => {
    render(<InputField label="Test" description="Helper text" />);
    expect(screen.getByText(/helper text/i)).toBeInTheDocument();
  });

  it('handles input changes', () => {
    const handleChange = jest.fn();
    render(<InputField label="Test" onChange={handleChange} />);
    
    const input = screen.getByLabelText(/test/i);
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies error styling when error is present', () => {
    render(<InputField label="Test" error="Error message" />);
    const input = screen.getByLabelText(/test/i);
    expect(input).toHaveClass('border-destructive');
  });
});
