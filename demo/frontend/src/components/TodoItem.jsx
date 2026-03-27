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
    <li className="todo-item">
      <input
        className="todo-checkbox"
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggle()}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
      />
      <span className={`todo-title${todo.completed ? ' todo-title--done' : ''}`}>
        {todo.title}
      </span>
      <button
        className="todo-delete"
        onClick={() => remove()}
        aria-label={`Delete "${todo.title}"`}
      >
        ×
      </button>
    </li>
  );
}
