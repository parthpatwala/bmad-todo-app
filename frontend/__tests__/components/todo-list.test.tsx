import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TodoList } from '../../src/components/todo-list';
import type { Todo } from '../../src/types/todo';

const todos: Todo[] = [
  { id: 1, description: 'First task', completed: false, createdAt: '2026-03-30T00:00:00Z' },
  { id: 2, description: 'Second task', completed: true, createdAt: '2026-03-30T01:00:00Z' },
  { id: 3, description: 'Third task', completed: false, createdAt: '2026-03-30T02:00:00Z' },
];

describe('TodoList', () => {
  it('renders a list of todos', () => {
    render(<TodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('First task')).toBeInTheDocument();
    expect(screen.getByText('Second task')).toBeInTheDocument();
    expect(screen.getByText('Third task')).toBeInTheDocument();
  });

  it('has aria-label with item count', () => {
    render(<TodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} />);
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-label', 'Todo list, 3 items');
  });

  it('uses singular "item" for single todo', () => {
    render(<TodoList todos={[todos[0]]} onToggle={vi.fn()} onDelete={vi.fn()} />);
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-label', 'Todo list, 1 item');
  });

  it('renders correct number of TodoItem components', () => {
    render(<TodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });
});
