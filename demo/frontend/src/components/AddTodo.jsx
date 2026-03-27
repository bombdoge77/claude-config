import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTodo } from '../api/todos';

export default function AddTodo() {
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setTitle('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) mutate(title.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="add-form">
      <input
        className="add-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="new task..."
      />
      <button type="submit" className="add-button" disabled={isPending} aria-label="Add task">
        {isPending ? '…' : '→'}
      </button>
    </form>
  );
}
