import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TodoInput } from '../../src/components/todo-input';

describe('TodoInput', () => {
  it('renders input field and Add button', () => {
    render(<TodoInput onAdd={vi.fn()} />);
    expect(screen.getByLabelText('New todo description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('calls onAdd with trimmed description on button click', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByLabelText('New todo description');
    await userEvent.type(input, '  Buy groceries  ');
    await userEvent.click(screen.getByRole('button', { name: /add todo/i }));

    expect(onAdd).toHaveBeenCalledWith('Buy groceries');
  });

  it('calls onAdd on Enter key press', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);

    const input = screen.getByLabelText('New todo description');
    await userEvent.type(input, 'New task{Enter}');

    expect(onAdd).toHaveBeenCalledWith('New task');
  });

  it('shows validation error for empty submission', async () => {
    render(<TodoInput onAdd={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /add todo/i }));

    expect(screen.getByText('Description cannot be empty')).toBeInTheDocument();
  });

  it('shows validation error for whitespace-only submission', async () => {
    render(<TodoInput onAdd={vi.fn()} />);

    const input = screen.getByLabelText('New todo description');
    await userEvent.type(input, '   ');
    await userEvent.click(screen.getByRole('button', { name: /add todo/i }));

    expect(screen.getByText('Description cannot be empty')).toBeInTheDocument();
  });

  it('shows validation error for description over 500 characters', async () => {
    render(<TodoInput onAdd={vi.fn()} />);

    const input = screen.getByLabelText('New todo description');
    const longText = 'a'.repeat(501);
    await userEvent.type(input, longText);
    await userEvent.click(screen.getByRole('button', { name: /add todo/i }));

    expect(screen.getByText('Description must be 500 characters or less')).toBeInTheDocument();
  });

  it('clears input after successful submission', async () => {
    render(<TodoInput onAdd={vi.fn()} />);

    const input = screen.getByLabelText('New todo description');
    await userEvent.type(input, 'Valid task');
    await userEvent.click(screen.getByRole('button', { name: /add todo/i }));

    expect(input).toHaveValue('');
  });

  it('displays server error when serverError prop is set', () => {
    render(<TodoInput onAdd={vi.fn()} serverError="Server failed" />);
    expect(screen.getByText('Server failed')).toBeInTheDocument();
  });

  it('clears server error on new submission (calls onClearServerError)', async () => {
    const onClearServerError = vi.fn();
    render(
      <TodoInput
        onAdd={vi.fn()}
        serverError="Old error"
        onClearServerError={onClearServerError}
      />,
    );

    const input = screen.getByLabelText('New todo description');
    await userEvent.type(input, 'New task');
    await userEvent.click(screen.getByRole('button', { name: /add todo/i }));

    expect(onClearServerError).toHaveBeenCalledOnce();
  });

  it('shows character count', () => {
    render(<TodoInput onAdd={vi.fn()} />);
    expect(screen.getByText('0 / 500')).toBeInTheDocument();
  });
});
