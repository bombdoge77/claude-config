import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';

export default function App() {
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Todos</h1>
      <AddTodo />
      <TodoList />
    </div>
  );
}
