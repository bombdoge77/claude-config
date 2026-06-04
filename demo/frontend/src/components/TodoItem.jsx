import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleTodo, deleteTodo } from '../api/todos';

const CARD_COLORS = [
  { bg: '#1f1a0e', border: '#302610' }, // amber
  { bg: '#0f1a11', border: '#152817' }, // sage
  { bg: '#0e1219', border: '#142030' }, // slate
  { bg: '#160f1d', border: '#23182d' }, // mauve
];

export default function TodoItem({ todo, selected = false, onToggleSelect }) {
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
      {onToggleSelect && !todo.completed && (
        <input
          className="todo-select-checkbox"
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(todo.id)}
          aria-label={`Select "${todo.title}"`}
        />
      )}
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
