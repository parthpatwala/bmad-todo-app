import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Todo } from '../types/todo';
import { fetchTodos, createTodo, toggleTodo, deleteTodo } from '../api/todo-api';

const QUERY_KEY = ['todos'] as const;

export function useTodos() {
  const queryClient = useQueryClient();

  const todosQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchTodos,
  });

  const addMutation = useMutation({
    mutationFn: (description: string) => createTodo(description),
    onMutate: async (description) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<Todo[]>(QUERY_KEY);
      queryClient.setQueryData<Todo[]>(QUERY_KEY, (old = []) => [
        ...old,
        { id: Date.now(), description, completed: false, createdAt: new Date().toISOString() },
      ]);
      return { previous };
    },
    onError: (_err, _desc, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      toggleTodo(id, completed),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<Todo[]>(QUERY_KEY);
      queryClient.setQueryData<Todo[]>(QUERY_KEY, (old = []) =>
        old.map((todo) => (todo.id === id ? { ...todo, completed } : todo)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<Todo[]>(QUERY_KEY);
      queryClient.setQueryData<Todo[]>(QUERY_KEY, (old = []) =>
        old.filter((todo) => todo.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    todos: todosQuery.data ?? [],
    isLoading: todosQuery.isLoading,
    isError: todosQuery.isError,
    addTodo: addMutation.mutate,
    addError: addMutation.error?.message ?? null,
    resetAddError: addMutation.reset,
    toggleTodo: (id: number, completed: boolean) =>
      toggleMutation.mutate({ id, completed }),
    deleteTodo: deleteMutation.mutate,
  };
}
