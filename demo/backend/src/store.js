let todos = [];
let nextId = 1;

const getAll = () => [...todos];

const create = (title) => {
  const todo = { id: String(nextId++), title, completed: false, createdAt: new Date().toISOString() };
  todos.push(todo);
  return todo;
};

const toggle = (id) => {
  const todo = todos.find(t => t.id === id);
  if (!todo) return null;
  todo.completed = !todo.completed;
  return { ...todo };
};

const remove = (id) => {
  const idx = todos.findIndex(t => t.id === id);
  if (idx === -1) return false;
  todos.splice(idx, 1);
  return true;
};

const bulkComplete = (ids) => {
  const updated = [];
  for (const todo of todos) {
    if (ids.includes(todo.id)) {
      todo.completed = true;
      updated.push({ ...todo });
    }
  }
  return updated;
};

const reset = () => { todos = []; nextId = 1; };

module.exports = { getAll, create, toggle, remove, bulkComplete, reset };
