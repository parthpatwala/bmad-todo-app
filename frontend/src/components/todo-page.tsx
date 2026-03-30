import { useTodos } from '../hooks/use-todos';
import { TodoInput } from './todo-input';
import { TodoList } from './todo-list';

export function TodoPage() {
  const { todos, isLoading, isError, addTodo, toggleTodo, deleteTodo } = useTodos();

  return (
    <div className="space-y-6">
      <TodoInput onAdd={addTodo} />

      {isLoading && <p className="text-gray-500">Loading...</p>}
      {isError && <p className="text-red-500">Failed to load todos.</p>}

      {!isLoading && !isError && (
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      )}
    </div>
  );
}
