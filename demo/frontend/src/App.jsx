import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTodos } from './api/todos';
import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';
import TodoDetailPanel from './components/TodoDetailPanel';

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const { data: todos } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos });
  const selected = todos?.find(t => t.id === selectedId);

  return (
    <div className={`app${selected ? ' app--with-panel' : ''}`}>
      <main className="app-main">
        <header className="app-header">
          <h1 className="app-title">tasks<span>.</span></h1>
          <hr className="app-rule" />
        </header>
        <AddTodo />
        <TodoList selectedId={selectedId} onSelect={setSelectedId} />
      </main>
      {selected && (
        <TodoDetailPanel key={selected.id} todo={selected} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
