import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleTodo, deleteTodo } from '../api/todos';

export default function TodoItem({ todo }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['todos'] });

  const { mutate: toggle } = useMutation({
    mutationFn: () => toggleTodo(todo.id),
    onSuccess: invalidate,
  });

  const { mutate: remove } = useMutation({
    mutationFn: () => deleteTodo(todo.id),
    onSuccess: invalidate,
  });

  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggle()}
      />
      <span style={{ flex: 1, textDecoration: todo.completed ? 'line-through' : 'none' }}>
        {todo.title}
      </span>
      <button onClick={() => remove()}>Delete</button>
    </li>
  );
}
