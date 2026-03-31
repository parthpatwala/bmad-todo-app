import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchTodos, createTodo, toggleTodo, deleteTodo } from '../../src/api/todo-api';

const mockTodo = {
  id: 1,
  description: 'Test todo',
  completed: false,
  createdAt: '2026-03-30T00:00:00Z',
};

describe('todo-api', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchTodos', () => {
    it('returns array on success', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([mockTodo]), { status: 200 }),
      );

      const result = await fetchTodos();
      expect(result).toEqual([mockTodo]);
      expect(fetch).toHaveBeenCalledWith('/api/todos');
    });

    it('throws Error with server message on failure', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ error: 'ERROR', message: 'DB down' }), {
          status: 500,
        }),
      );

      await expect(fetchTodos()).rejects.toThrow('DB down');
    });

    it('throws default message on non-JSON error response', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response('Internal Server Error', { status: 500 }),
      );

      await expect(fetchTodos()).rejects.toThrow(
        'Unable to load todos. Please try again.',
      );
    });
  });

  describe('createTodo', () => {
    it('sends POST with description, returns todo', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(mockTodo), { status: 201 }),
      );

      const result = await createTodo('Test todo');
      expect(result).toEqual(mockTodo);
      expect(fetch).toHaveBeenCalledWith('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'Test todo' }),
      });
    });

    it('throws Error with server message on failure', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({ error: 'VALIDATION_ERROR', message: 'Description too long' }),
          { status: 400 },
        ),
      );

      await expect(createTodo('x'.repeat(501))).rejects.toThrow('Description too long');
    });
  });

  describe('toggleTodo', () => {
    it('sends PATCH with completed, returns todo', async () => {
      const toggled = { ...mockTodo, completed: true };
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(toggled), { status: 200 }),
      );

      const result = await toggleTodo(1, true);
      expect(result).toEqual(toggled);
      expect(fetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
    });

    it('throws Error with server message on failure', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({ error: 'NOT_FOUND', message: 'Todo not found' }),
          { status: 404 },
        ),
      );

      await expect(toggleTodo(1, true)).rejects.toThrow('Todo not found');
    });

    it('throws default message on non-JSON error response', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response('Internal Server Error', { status: 500 }),
      );

      await expect(toggleTodo(1, true)).rejects.toThrow(
        'Failed to update todo. Please try again.',
      );
    });
  });

  describe('deleteTodo', () => {
    it('sends DELETE, resolves void', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(null, { status: 204 }),
      );

      await expect(deleteTodo(1)).resolves.toBeUndefined();
      expect(fetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'DELETE',
      });
    });

    it('throws Error on failure', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({ error: 'NOT_FOUND', message: 'Todo not found' }),
          { status: 404 },
        ),
      );

      await expect(deleteTodo(999)).rejects.toThrow('Todo not found');
    });
  });
});
