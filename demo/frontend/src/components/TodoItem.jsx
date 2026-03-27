import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleTodo, deleteTodo } from '../api/todos';

const CARD_COLORS = [
  { bg: '#1f1a0e', border: '#302610' }, // amber
  { bg: '#1a0f12', border: '#2a1519' }, // rose
  { bg: '#0f1a11', border: '#152817' }, // sage
  { bg: '#0e1219', border: '#142030' }, // slate
  { bg: '#1e1309', border: '#2e1e0d' }, // terra
  { bg: '#160f1d', border: '#23182d' }, // mauve
];

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

  const { bg, border } = CARD_COLORS[parseInt(todo.id) % CARD_COLORS.length];

  return (
    <li className="todo-item" style={{ background: bg, borderColor: border }}>
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
