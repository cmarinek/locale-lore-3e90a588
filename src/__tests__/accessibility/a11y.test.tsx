
import { render } from '@/test/utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/molecules/InputField';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('Button should not have accessibility violations', async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('InputField should not have accessibility violations', async () => {
    const { container } = render(
      <InputField 
        label="Accessible Input" 
        description="This input is accessible"
        id="accessible-input"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Form with error should maintain accessibility', async () => {
    const { container } = render(
      <InputField 
        label="Required Field" 
        error="This field is required"
        id="required-field"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
