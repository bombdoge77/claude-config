import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">tasks<span>.</span></h1>
        <hr className="app-rule" />
      </header>
      <AddTodo />
      <TodoList />
    </div>
  );
}
