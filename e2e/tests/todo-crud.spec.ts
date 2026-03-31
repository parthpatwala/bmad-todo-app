import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  const response = await page.request.get('/api/todos');
  const todos = await response.json();
  for (const todo of todos) {
    await page.request.delete(`/api/todos/${todo.id}`);
  }
  await page.goto('/');
});

test.describe('Todo CRUD', () => {
  test('creates a new todo', async ({ page }) => {
    const input = page.getByLabel('New todo description');
    await input.fill('Buy groceries');
    await page.getByRole('button', { name: /add todo/i }).click();

    const todoList = page.getByRole('list', { name: /todo list/i });
    await expect(todoList.getByText('Buy groceries')).toBeVisible();
  });

  test('toggles todo completion', async ({ page }) => {
    const input = page.getByLabel('New todo description');
    await input.fill('Walk the dog');
    await page.getByRole('button', { name: /add todo/i }).click();

    const todoList = page.getByRole('list', { name: /todo list/i });
    await expect(todoList.getByText('Walk the dog')).toBeVisible();

    const checkbox = page.getByRole('checkbox', { name: /walk the dog/i });
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  });

  test('deletes a todo', async ({ page }) => {
    const input = page.getByLabel('New todo description');
    await input.fill('Clean the house');
    await page.getByRole('button', { name: /add todo/i }).click();

    const todoList = page.getByRole('list', { name: /todo list/i });
    await expect(todoList.getByText('Clean the house')).toBeVisible();

    await page.getByRole('button', { name: /delete "Clean the house"/i }).click();

    await expect(todoList).not.toBeVisible();
  });

  test('persists todos after page reload', async ({ page }) => {
    const input = page.getByLabel('New todo description');
    await input.fill('Read a book');
    await page.getByRole('button', { name: /add todo/i }).click();

    const todoList = page.getByRole('list', { name: /todo list/i });
    await expect(todoList.getByText('Read a book')).toBeVisible();

    await page.reload();

    await expect(todoList.getByText('Read a book')).toBeVisible();
  });
});
