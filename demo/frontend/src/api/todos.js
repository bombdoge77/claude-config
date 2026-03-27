const checkOk = (r) => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r;
};

export const fetchTodos = () =>
  fetch('/api/todos').then(checkOk).then(r => r.json());

export const createTodo = (title) =>
  fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  }).then(checkOk).then(r => r.json());

export const toggleTodo = (id) =>
  fetch(`/api/todos/${id}`, { method: 'PATCH' }).then(checkOk).then(r => r.json());

export const deleteTodo = (id) =>
  fetch(`/api/todos/${id}`, { method: 'DELETE' }).then(checkOk);
