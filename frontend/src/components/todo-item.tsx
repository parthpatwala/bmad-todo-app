import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  focusRef?: (el: HTMLInputElement | null) => void;
}

export function TodoItem({ todo, onToggle, onDelete, focusRef }: TodoItemProps) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-3 min-h-[44px]">
      <label className="flex items-center justify-center min-h-[44px] min-w-[44px] shrink-0 cursor-pointer">
        <input
          ref={focusRef}
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id, !todo.completed)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onToggle(todo.id, !todo.completed);
            }
          }}
          className="h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
        />
      </label>
      <span
        className={`flex-1 break-words ${
          todo.completed ? 'text-gray-400 line-through' : 'text-gray-900'
        }`}
      >
        {todo.description}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="min-h-[44px] min-w-[44px] shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Delete
      </button>
    </li>
  );
}
