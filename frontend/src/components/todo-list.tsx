import type { Todo } from '../types/todo';
import { TodoItem } from './todo-item';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  todoRefs?: React.RefObject<Map<number, HTMLInputElement>>;
}

export function TodoList({ todos, onToggle, onDelete, todoRefs }: TodoListProps) {
  return (
    <ul className="space-y-2" aria-label={`Todo list, ${todos.length} ${todos.length === 1 ? 'item' : 'items'}`}>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          focusRef={(el) => {
            if (!todoRefs?.current) return;
            if (el) {
              todoRefs.current.set(todo.id, el);
            } else {
              todoRefs.current.delete(todo.id);
            }
          }}
        />
      ))}
    </ul>
  );
}
