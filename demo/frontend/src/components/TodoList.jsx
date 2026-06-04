import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTodos, bulkComplete } from '../api/todos';
import TodoItem from './TodoItem';

export default function TodoList() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const queryClient = useQueryClient();

  const { data: todos, isLoading, isError } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  const { mutate: completeSelected, isPending } = useMutation({
    mutationFn: () => bulkComplete([...selectedIds]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setSelectedIds(new Set());
      setSelectionMode(false);
    },
  });

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  if (isLoading) return <p className="todo-state">loading...</p>;
  if (isError) return <p className="todo-state">backend unreachable</p>;
  if (!todos?.length) return <p className="todo-state">no tasks yet</p>;

  return (
    <div className="todo-list-container">
      <div className="todo-list-toolbar">
        <button
          className="todo-select-toggle"
          onClick={selectionMode ? handleCancelSelection : () => setSelectionMode(true)}
          aria-label={selectionMode ? 'Cancel selection mode' : 'Enter selection mode'}
        >
          {selectionMode ? 'cancel' : 'select'}
        </button>

        {selectionMode && selectedIds.size > 0 && (
          <button
            className="todo-bulk-complete"
            onClick={() => completeSelected()}
            disabled={isPending}
            aria-label={`Complete ${selectedIds.size} selected todos`}
          >
            {isPending ? 'completing…' : `complete selected (${selectedIds.size})`}
          </button>
        )}
      </div>

      <ul className="todo-list">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            selected={selectedIds.has(todo.id)}
            onToggleSelect={selectionMode ? handleToggleSelect : undefined}
          />
        ))}
      </ul>
    </div>
  );
}
