import { useState, useEffect, useRef, useCallback } from 'react';
import { useTodos } from '../hooks/use-todos';
import { TodoInput } from './todo-input';
import { TodoList } from './todo-list';
import { LoadingState } from './loading-state';
import { EmptyState } from './empty-state';
import { ErrorBanner } from './error-banner';

export function TodoPage() {
  const {
    todos, isLoading, isError, refetch,
    addTodo, addError, resetAddError,
    toggleTodo, toggleError, resetToggleError,
    deleteTodo, deleteError, resetDeleteError,
  } = useTodos();

  const [fetchErrorDismissed, setFetchErrorDismissed] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const todoRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  useEffect(() => {
    if (!isError) setFetchErrorDismissed(false);
  }, [isError]);

  const announce = useCallback((message: string) => {
    setAnnouncement('');
    requestAnimationFrame(() => {
      setAnnouncement(message);
    });
  }, []);

  const handleAdd = useCallback((description: string) => {
    addTodo(description);
    announce(`Todo added: ${description}`);
  }, [addTodo, announce]);

  const handleToggle = useCallback((id: number, completed: boolean) => {
    const todo = todos.find(t => t.id === id);
    toggleTodo(id, completed);
    if (todo) {
      announce(`${todo.description} marked as ${completed ? 'complete' : 'incomplete'}`);
    }
  }, [todos, toggleTodo, announce]);

  const handleDelete = useCallback((id: number) => {
    const todo = todos.find(t => t.id === id);
    const todoIds = todos.map(t => t.id);
    const deletedIndex = todoIds.indexOf(id);
    deleteTodo(id);

    if (todo) {
      announce(`Todo deleted: ${todo.description}`);
    }

    requestAnimationFrame(() => {
      const remainingIds = todoIds.filter(tid => tid !== id);
      if (remainingIds.length === 0) {
        inputRef.current?.focus();
      } else {
        const nextId = remainingIds[Math.min(deletedIndex, remainingIds.length - 1)];
        todoRefs.current.get(nextId)?.focus();
      }
    });
  }, [todos, deleteTodo, announce]);

  const mutationError = toggleError || deleteError;
  const resetMutationError = toggleError ? resetToggleError : resetDeleteError;
  const showFetchError = isError && !fetchErrorDismissed;

  return (
    <div className="space-y-6">
      <TodoInput onAdd={handleAdd} serverError={addError} onClearServerError={resetAddError} inputRef={inputRef} />

      {isLoading && <LoadingState />}

      {showFetchError && (
        <ErrorBanner
          message="Unable to load todos. Please try again."
          onDismiss={() => setFetchErrorDismissed(true)}
          onRetry={refetch}
        />
      )}

      {mutationError && (
        <ErrorBanner
          message={mutationError}
          onDismiss={resetMutationError}
        />
      )}

      {!isLoading && !isError && todos.length === 0 && <EmptyState />}

      {!isLoading && todos.length > 0 && (
        <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} todoRefs={todoRefs} />
      )}

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
