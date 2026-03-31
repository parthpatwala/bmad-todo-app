import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { useTodos } from '../../src/hooks/use-todos';

const mockTodo = {
  id: 1,
  description: 'Test todo',
  completed: false,
  createdAt: '2026-03-30T00:00:00Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useTodos', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns todos from query', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([mockTodo]), { status: 200 }),
    );

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.todos).toEqual([mockTodo]);
    });
  });

  it('returns isLoading true while fetching', () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      () => new Promise(() => {}),
    );

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('returns isError true on fetch failure', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('Error', { status: 500 }),
    );

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('addTodo calls createTodo mutation', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(mockTodo), { status: 201 }),
    );

    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify([mockTodo]), { status: 200 }),
    );

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.addTodo('Test todo');

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/todos', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ description: 'Test todo' }),
      }));
    });
  });

  it('toggleTodo calls toggleTodo mutation', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify([mockTodo]), { status: 200 }),
    );

    const toggledTodo = { ...mockTodo, completed: true };
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(toggledTodo), { status: 200 }),
    );

    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify([toggledTodo]), { status: 200 }),
    );

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.toggleTodo(1, true);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/todos/1', expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ completed: true }),
      }));
    });
  });

  it('deleteTodo calls deleteTodo mutation', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify([mockTodo]), { status: 200 }),
    );

    fetchSpy.mockResolvedValueOnce(
      new Response(null, { status: 204 }),
    );

    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.deleteTodo(1);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/todos/1', expect.objectContaining({
        method: 'DELETE',
      }));
    });
  });
});
