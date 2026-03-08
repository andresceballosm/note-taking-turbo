import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputText } from '../input.component';

describe('InputText', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<InputText />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<InputText placeholder="Enter your name" />);

      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('should render with value', () => {
      render(<InputText value="Test value" readOnly />);

      expect(screen.getByRole('textbox')).toHaveValue('Test value');
    });

    it('should render with endAdornment', () => {
      const adornment = <span data-testid="adornment">👁️</span>;
      render(<InputText endAdornment={adornment} />);

      expect(screen.getByTestId('adornment')).toBeInTheDocument();
    });
  });

  describe('ID handling', () => {
    it('should use provided id', () => {
      render(<InputText id="custom-id" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'custom-id');
    });

    it('should generate unique id when not provided', () => {
      const { container } = render(
        <>
          <InputText />
          <InputText />
        </>
      );

      const inputs = container.querySelectorAll('input');
      const firstId = inputs[0].getAttribute('id');
      const secondId = inputs[1].getAttribute('id');

      expect(firstId).toBeTruthy();
      expect(secondId).toBeTruthy();
      expect(firstId).not.toBe(secondId);
    });
  });

  describe('User interaction', () => {
    it('should allow typing text', async () => {
      const user = userEvent.setup();
      render(<InputText />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello World');

      expect(input).toHaveValue('Hello World');
    });

    it('should call onChange handler', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<InputText onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Test');

      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledTimes(4); // Once per character
    });

    it('should call onFocus handler', async () => {
      const user = userEvent.setup();
      const handleFocus = jest.fn();
      render(<InputText onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur handler', async () => {
      const user = userEvent.setup();
      const handleBlur = jest.fn();
      render(<InputText onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab(); // Tab away to trigger blur

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input attributes', () => {
    it('should apply type attribute', () => {
      render(<InputText type="email" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('should apply name attribute', () => {
      render(<InputText name="username" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username');
    });

    it('should apply required attribute', () => {
      render(<InputText required />);

      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('should apply disabled attribute', () => {
      render(<InputText disabled />);

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should apply readOnly attribute', () => {
      render(<InputText readOnly />);

      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });

    it('should apply maxLength attribute', () => {
      render(<InputText maxLength={10} />);

      expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '10');
    });
  });

  describe('Custom styling', () => {
    it('should apply custom className to input', () => {
      render(<InputText className="custom-input" />);

      expect(screen.getByRole('textbox')).toHaveClass('custom-input');
    });

    it('should apply custom containerClassName', () => {
      const { container } = render(<InputText containerClassName="custom-container" />);

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass('custom-container');
    });

    it('should preserve default classes when custom className is added', () => {
      render(<InputText className="custom-input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('bg-transparent');
    });
  });

  describe('Controlled component', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      let value = '';
      const handleChange = jest.fn((e) => {
        value = e.target.value;
      });

      const { rerender } = render(
        <InputText value={value} onChange={handleChange} />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'A');

      expect(handleChange).toHaveBeenCalled();

      // Simulate parent component updating the value
      rerender(<InputText value="A" onChange={handleChange} />);

      expect(screen.getByRole('textbox')).toHaveValue('A');
    });
  });

  describe('Accessibility', () => {
    it('should be focusable', async () => {
      const user = userEvent.setup();
      render(<InputText />);

      const input = screen.getByRole('textbox');
      await user.tab();

      expect(input).toHaveFocus();
    });

    it('should support aria-label', () => {
      render(<InputText aria-label="Username input" />);

      expect(screen.getByLabelText('Username input')).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <InputText aria-describedby="helper-text" />
          <span id="helper-text">Enter your username</span>
        </>
      );

      expect(screen.getByRole('textbox')).toHaveAttribute(
        'aria-describedby',
        'helper-text'
      );
    });
  });

  describe('Password input with endAdornment', () => {
    it('should render password input with toggle visibility icon', () => {
      const ToggleIcon = () => <button data-testid="toggle-icon">👁️</button>;

      const { container } = render(
        <InputText type="password" endAdornment={<ToggleIcon />} />
      );

      const input = container.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
      expect(screen.getByTestId('toggle-icon')).toBeInTheDocument();
    });
  });
});
