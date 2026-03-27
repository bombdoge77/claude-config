import { useQuery } from '@tanstack/react-query';
import { fetchTodos } from '../api/todos';
import TodoItem from './TodoItem';

export default function TodoList() {
  const { data: todos, isLoading, isError } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  if (isLoading) return <p className="todo-state">loading...</p>;
  if (isError) return <p className="todo-state">backend unreachable</p>;
  if (!todos?.length) return <p className="todo-state">no tasks yet</p>;

  return (
    <ul className="todo-list">
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
