import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ButtonComponent } from '../button.component';

describe('ButtonComponent', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      render(<ButtonComponent title="Click me" />);

      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should render with icon when provided', () => {
      const icon = <span data-testid="test-icon">📝</span>;
      render(<ButtonComponent title="Save" icon={icon} />);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should render loading spinner when loading is true', () => {
      render(<ButtonComponent title="Submit" loading />);

      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should not render icon when loading', () => {
      const icon = <span data-testid="test-icon">📝</span>;
      render(<ButtonComponent title="Save" icon={icon} loading />);

      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });
  });

  describe('Size variants', () => {
    it('should apply note size classes by default', () => {
      render(<ButtonComponent title="Note Button" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-[133px]', 'h-[43px]');
    });

    it('should apply auth size classes when size is auth', () => {
      render(<ButtonComponent title="Auth Button" size="auth" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-[384px]', 'h-[43px]');
    });
  });

  describe('Button type', () => {
    it('should have button type by default', () => {
      render(<ButtonComponent title="Default" />);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('should have submit type when specified', () => {
      render(<ButtonComponent title="Submit" type="submit" />);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should have reset type when specified', () => {
      render(<ButtonComponent title="Reset" type="reset" />);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
  });

  describe('Disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<ButtonComponent title="Disabled" disabled />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should be disabled when loading is true', () => {
      render(<ButtonComponent title="Loading" loading />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should not be disabled by default', () => {
      render(<ButtonComponent title="Enabled" />);

      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  describe('Click handling', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<ButtonComponent title="Click me" onClick={handleClick} />);

      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<ButtonComponent title="Disabled" onClick={handleClick} disabled />);

      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<ButtonComponent title="Loading" onClick={handleClick} loading />);

      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should work without onClick handler', async () => {
      const user = userEvent.setup();
      render(<ButtonComponent title="No handler" />);

      // Should not throw error
      await expect(user.click(screen.getByRole('button'))).resolves.not.toThrow();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<ButtonComponent title="Custom" className="custom-class" />);

      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      render(<ButtonComponent title="Merged" className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('rounded-[46px]');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when loading', () => {
      render(<ButtonComponent title="Submit" loading />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have proper ARIA attributes when disabled', () => {
      render(<ButtonComponent title="Submit" disabled />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<ButtonComponent title="Submit" onClick={handleClick} />);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
