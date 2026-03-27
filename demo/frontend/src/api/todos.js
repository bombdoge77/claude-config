export const fetchTodos = () =>
  fetch('/api/todos').then(r => r.json());

export const createTodo = (title) =>
  fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  }).then(r => r.json());

export const toggleTodo = (id) =>
  fetch(`/api/todos/${id}`, { method: 'PATCH' }).then(r => r.json());

export const deleteTodo = (id) =>
  fetch(`/api/todos/${id}`, { method: 'DELETE' });
