import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!isError) setFetchErrorDismissed(false);
  }, [isError]);

  const mutationError = toggleError || deleteError;
  const resetMutationError = toggleError ? resetToggleError : resetDeleteError;
  const showFetchError = isError && !fetchErrorDismissed;

  return (
    <div className="space-y-6">
      <TodoInput onAdd={addTodo} serverError={addError} onClearServerError={resetAddError} />

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
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      )}
    </div>
  );
}
