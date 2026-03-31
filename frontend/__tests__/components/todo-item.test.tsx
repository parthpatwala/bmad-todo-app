import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TodoItem } from '../../src/components/todo-item';
import type { Todo } from '../../src/types/todo';

const baseTodo: Todo = {
  id: 1,
  description: 'Test todo',
  completed: false,
  createdAt: '2026-03-30T00:00:00Z',
};

describe('TodoItem', () => {
  it('renders todo description', () => {
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  it('renders checkbox as checked for completed todos', () => {
    const completedTodo = { ...baseTodo, completed: true };
    render(<TodoItem todo={completedTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('renders checkbox as unchecked for incomplete todos', () => {
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('calls onToggle when checkbox is clicked', async () => {
    const onToggle = vi.fn();
    render(<TodoItem todo={baseTodo} onToggle={onToggle} onDelete={vi.fn()} />);

    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith(1, true);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={onDelete} />);

    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('calls onToggle when Enter is pressed on checkbox', async () => {
    const onToggle = vi.fn();
    render(<TodoItem todo={baseTodo} onToggle={onToggle} onDelete={vi.fn()} />);

    const checkbox = screen.getByRole('checkbox');
    checkbox.focus();
    await userEvent.keyboard('{Enter}');

    expect(onToggle).toHaveBeenCalledWith(1, true);
  });

  it('has aria-label on checkbox and delete button', () => {
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Mark "Test todo" as complete');

    const deleteBtn = screen.getByRole('button', { name: 'Delete "Test todo"' });
    expect(deleteBtn).toBeInTheDocument();
  });
});
