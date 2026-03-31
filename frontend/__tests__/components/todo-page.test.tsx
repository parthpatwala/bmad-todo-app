import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoPage } from '../../src/components/todo-page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';

const mockUseTodos = {
  todos: [] as Array<{ id: number; description: string; completed: boolean; createdAt: string }>,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  addTodo: vi.fn(),
  addError: null as string | null,
  resetAddError: vi.fn(),
  toggleTodo: vi.fn(),
  toggleError: null as string | null,
  resetToggleError: vi.fn(),
  deleteTodo: vi.fn(),
  deleteError: null as string | null,
  resetDeleteError: vi.fn(),
};

vi.mock('../../src/hooks/use-todos', () => ({
  useTodos: () => mockUseTodos,
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('TodoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTodos.todos = [];
    mockUseTodos.isLoading = false;
    mockUseTodos.isError = false;
    mockUseTodos.addError = null;
    mockUseTodos.toggleError = null;
    mockUseTodos.deleteError = null;
  });

  it('renders loading state when isLoading is true', () => {
    mockUseTodos.isLoading = true;
    render(<TodoPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Loading todos...')).toBeInTheDocument();
  });

  it('renders empty state when no todos and not loading', () => {
    render(<TodoPage />, { wrapper: createWrapper() });
    expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
  });

  it('renders todo list when todos exist', () => {
    mockUseTodos.todos = [
      { id: 1, description: 'First task', completed: false, createdAt: '2026-03-30T00:00:00Z' },
    ];
    render(<TodoPage />, { wrapper: createWrapper() });
    expect(screen.getByText('First task')).toBeInTheDocument();
  });

  it('renders fetch error banner when isError is true', () => {
    mockUseTodos.isError = true;
    render(<TodoPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Unable to load todos. Please try again.')).toBeInTheDocument();
  });

  it('dismisses fetch error when Dismiss is clicked', async () => {
    mockUseTodos.isError = true;
    render(<TodoPage />, { wrapper: createWrapper() });

    const dismissBtn = screen.getByRole('button', { name: /dismiss/i });
    await userEvent.click(dismissBtn);

    expect(screen.queryByText('Unable to load todos. Please try again.')).not.toBeInTheDocument();
  });

  it('renders mutation error banner for toggle error', () => {
    mockUseTodos.toggleError = 'Failed to toggle todo';
    render(<TodoPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Failed to toggle todo')).toBeInTheDocument();
  });

  it('renders mutation error banner for delete error', () => {
    mockUseTodos.deleteError = 'Failed to delete todo';
    render(<TodoPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Failed to delete todo')).toBeInTheDocument();
  });

  it('calls addTodo when a new todo is submitted', async () => {
    render(<TodoPage />, { wrapper: createWrapper() });

    const input = screen.getByLabelText('New todo description');
    await userEvent.type(input, 'New task');
    await userEvent.click(screen.getByRole('button', { name: /add todo/i }));

    expect(mockUseTodos.addTodo).toHaveBeenCalledWith('New task');
  });

  it('displays add error from server', () => {
    mockUseTodos.addError = 'Server validation failed';
    render(<TodoPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Server validation failed')).toBeInTheDocument();
  });

  it('renders aria-live region for announcements', () => {
    render(<TodoPage />, { wrapper: createWrapper() });
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  it('shows stale data when fetch error occurs but todos exist', () => {
    mockUseTodos.isError = true;
    mockUseTodos.todos = [
      { id: 1, description: 'Stale task', completed: false, createdAt: '2026-03-30T00:00:00Z' },
    ];
    render(<TodoPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Stale task')).toBeInTheDocument();
    expect(screen.getByText('Unable to load todos. Please try again.')).toBeInTheDocument();
  });
});
