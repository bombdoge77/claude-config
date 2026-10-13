import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleTodo, deleteTodo } from '../api/todos';

const CARD_COLORS = [
  { bg: '#1f1a0e', border: '#302610' }, // amber
  { bg: '#0f1a11', border: '#152817' }, // sage
  { bg: '#0e1219', border: '#142030' }, // slate
  { bg: '#160f1d', border: '#23182d' }, // mauve
];

export default function TodoItem({ todo, selected, onSelect }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['todos'] });

  const { mutate: toggle } = useMutation({
    mutationFn: () => toggleTodo(todo.id),
    onSuccess: invalidate,
  });

  const { mutate: remove } = useMutation({
    mutationFn: () => deleteTodo(todo.id),
    onSuccess: () => {
      if (selected) onSelect(null);
      invalidate();
    },
  });

  const { bg, border } = CARD_COLORS[parseInt(todo.id) % CARD_COLORS.length];

  return (
    <li
      className={`todo-item${selected ? ' todo-item--selected' : ''}`}
      style={{ background: bg, borderColor: selected ? 'var(--accent)' : border }}
    >
      <input
        className="todo-checkbox"
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggle()}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
      />
      <button
        type="button"
        className={`todo-title${todo.completed ? ' todo-title--done' : ''}`}
        onClick={() => onSelect(todo.id)}
        aria-pressed={selected}
      >
        {todo.title}
      </button>
      {todo.notes && <span className="todo-notes-dot" role="img" aria-label="Has notes" />}
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
