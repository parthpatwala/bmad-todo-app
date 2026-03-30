import type { Todo } from '../types/todo';

export const MAX_DESCRIPTION_LENGTH = 500;

const API_BASE = '/api/todos';

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    let message = 'Unable to load todos. Please try again.';
    try {
      const body = await response.json();
      if (body.message) message = body.message;
    } catch {
      // non-JSON response
    }
    throw new Error(message);
  }
  return response.json();
}

export async function createTodo(description: string): Promise<Todo> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });
  if (!response.ok) {
    let message = 'Failed to create todo';
    try {
      const body = await response.json();
      if (body.message) message = body.message;
    } catch {
      // non-JSON response
    }
    throw new Error(message);
  }
  return response.json();
}

export async function toggleTodo(id: number, completed: boolean): Promise<Todo> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  if (!response.ok) {
    let message = 'Failed to update todo. Please try again.';
    try {
      const body = await response.json();
      if (body.message) message = body.message;
    } catch {
      // non-JSON response
    }
    throw new Error(message);
  }
  return response.json();
}

export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    let message = 'Failed to delete todo. Please try again.';
    try {
      const body = await response.json();
      if (body.message) message = body.message;
    } catch {
      // non-JSON response
    }
    throw new Error(message);
  }
}
