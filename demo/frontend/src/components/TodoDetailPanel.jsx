import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleTodo, updateNotes } from '../api/todos';

const MAX_NOTES_LENGTH = 2000;

const formatCreated = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function TodoDetailPanel({ todo, onClose }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['todos'] });

  const [draft, setDraft] = useState(todo.notes);
  // Refs mirror the draft and last-saved value so blur/close handlers never read stale state.
  const draftRef = useRef(todo.notes);
  const savedRef = useRef(todo.notes);
  const inFlightRef = useRef(null);

  const { mutate: toggle } = useMutation({
    mutationFn: () => toggleTodo(todo.id),
    onSuccess: invalidate,
  });

  const { mutateAsync: saveNotes, isPending, isError } = useMutation({
    mutationFn: (notes) => updateNotes(todo.id, notes),
    onSuccess: invalidate,
  });

  // Saves the draft unless it matches the last saved value. Rejects on failure.
  const save = () => {
    const notes = draftRef.current;
    if (notes === savedRef.current) return Promise.resolve();
    const previous = savedRef.current;
    savedRef.current = notes;
    inFlightRef.current = saveNotes(notes).catch((err) => {
      savedRef.current = previous;
      throw err;
    });
    return inFlightRef.current;
  };

  // Failures surface through the mutation's isError state.
  const saveQuietly = () => save().catch(() => {});

  const close = async () => {
    await inFlightRef.current?.catch(() => {});
    try {
      await save();
    } catch {
      return; // keep the panel open so the draft and error stay visible
    }
    onClose();
  };

  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <aside className="detail-panel" aria-label="Task detail">
      <div className="detail-header">
        <span className="detail-label">task detail</span>
        <button type="button" className="detail-close" onClick={close} aria-label="Close detail panel">
          ×
        </button>
      </div>

      <div className="detail-summary">
        <input
          className="todo-checkbox detail-checkbox"
          type="checkbox"
          checked={todo.completed}
          onChange={() => toggle()}
          aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
        />
        <div>
          <h2 className={`detail-title${todo.completed ? ' todo-title--done' : ''}`}>{todo.title}</h2>
          <p className="detail-meta">Created {formatCreated(todo.createdAt)}</p>
        </div>
      </div>

      <label className="detail-label" htmlFor="detail-notes">notes</label>
      <textarea
        id="detail-notes"
        className="detail-notes"
        value={draft}
        maxLength={MAX_NOTES_LENGTH}
        onChange={(e) => {
          draftRef.current = e.target.value;
          setDraft(e.target.value);
        }}
        onBlur={saveQuietly}
        placeholder="add notes..."
      />

      <div className="detail-actions">
        {isError && (
          <p className="detail-error" role="alert">couldn't save notes — try again</p>
        )}
        <button type="button" className="detail-save" onClick={saveQuietly} disabled={isPending}>
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </aside>
  );
}
