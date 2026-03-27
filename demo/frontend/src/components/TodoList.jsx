import { useQuery } from '@tanstack/react-query';
import { fetchTodos } from '../api/todos';
import TodoItem from './TodoItem';

export default function TodoList() {
  const { data: todos, isLoading, isError } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading todos. Is the backend running?</p>;
  if (!todos?.length) return <p>No todos yet. Add one above!</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
