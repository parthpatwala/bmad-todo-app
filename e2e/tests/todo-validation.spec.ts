import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  const response = await page.request.get('/api/todos');
  const todos = await response.json();
  for (const todo of todos) {
    await page.request.delete(`/api/todos/${todo.id}`);
  }
  await page.goto('/');
});

test.describe('Todo Validation', () => {
  test('shows error for empty description and prevents creation', async ({ page }) => {
    await page.getByRole('button', { name: /add todo/i }).click();

    await expect(page.getByText('Description cannot be empty')).toBeVisible();

    const todoList = page.getByRole('list', { name: /todo list/i });
    await expect(todoList).not.toBeVisible();
  });
});
