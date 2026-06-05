import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTodos, bulkComplete } from '../api/todos';
import TodoItem from './TodoItem';

export default function TodoList() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkError, setBulkError] = useState(null);

  const queryClient = useQueryClient();

  const { data: todos, isLoading, isError } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  // Keep selectedIds in sync: drop any IDs that have been completed elsewhere
  useEffect(() => {
    if (!todos) return;
    const completedIds = new Set(todos.filter(t => t.completed).map(t => t.id));
    setSelectedIds(prev => {
      const next = new Set([...prev].filter(id => !completedIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [todos]);

  const { mutate: completeSelected, isPending } = useMutation({
    mutationFn: () => bulkComplete([...selectedIds]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setSelectedIds(new Set());
      setSelectionMode(false);
      setBulkError(null);
    },
    onError: (err) => {
      setBulkError(err.message ?? 'Failed to complete todos — please try again.');
    },
  });

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleMode = () => {
    setSelectionMode((prev) => !prev);
    setSelectedIds(new Set());
  };

  if (isLoading) return <p className="todo-state">loading...</p>;
  if (isError) return <p className="todo-state">backend unreachable</p>;
  if (!todos?.length) return <p className="todo-state">no tasks yet</p>;

  return (
    <div>
      <div className="todo-toolbar">
        <button
          className="todo-select-btn"
          onClick={handleToggleMode}
          aria-label={selectionMode ? 'Cancel selection mode' : 'Enter selection mode'}
        >
          {selectionMode ? 'cancel' : 'select'}
        </button>
        {selectionMode && selectedIds.size > 0 && (
          <button
            className="todo-bulk-btn"
            onClick={() => completeSelected()}
            disabled={isPending}
            aria-label={`Complete ${selectedIds.size} selected todo${selectedIds.size !== 1 ? 's' : ''}`}
          >
            {isPending ? 'completing…' : `complete selected (${selectedIds.size})`}
          </button>
        )}
        {bulkError && (
          <span className="todo-bulk-error" role="alert">{bulkError}</span>
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
