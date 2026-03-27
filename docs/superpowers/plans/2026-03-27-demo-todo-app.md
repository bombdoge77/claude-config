# Demo Todo App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a simple full-stack todo app with a React + React Query frontend and a Node.js Express backend communicating over localhost HTTP.

**Architecture:** Express backend with in-memory storage exposes a REST API at `localhost:3001/api/todos`. Vite dev server at `localhost:5173` proxies `/api` requests to the backend, eliminating CORS concerns. React Query manages all server state in the frontend.

**Tech Stack:** Node.js, Express, Jest, Supertest (backend) / Vite, React, @tanstack/react-query (frontend)

---

## File Map

### Backend (`demo/backend/`)
- `package.json` — dependencies and test/start scripts
- `src/app.js` — Express app setup exported without listen (for testability)
- `src/index.js` — imports app, calls listen on port 3001
- `src/store.js` — in-memory todo CRUD with `reset()` for test isolation
- `src/routes/todos.js` — four REST route handlers
- `tests/store.test.js` — unit tests for the store
- `tests/todos.test.js` — supertest integration tests for all routes

### Frontend (`demo/frontend/`)
- `package.json` — dependencies and dev script
- `vite.config.js` — React plugin + `/api` proxy to `localhost:3001`
- `index.html` — Vite entry HTML
- `src/main.jsx` — mounts app wrapped in `QueryClientProvider`
- `src/App.jsx` — root layout rendering `AddTodo` + `TodoList`
- `src/api/todos.js` — fetch wrappers for all four routes
- `src/components/AddTodo.jsx` — form with `useMutation` to POST
- `src/components/TodoList.jsx` — `useQuery` to fetch and render list
- `src/components/TodoItem.jsx` — checkbox toggle + delete button

---

### Task 1: Scaffold backend

**Files:**
- Create: `demo/backend/package.json`
- Create: `demo/backend/src/app.js`
- Create: `demo/backend/src/index.js`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p demo/backend/src/routes demo/backend/tests
```

- [ ] **Step 2: Create `demo/backend/package.json`**

```json
{
  "name": "todo-backend",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^7.0.0"
  }
}
```

- [ ] **Step 3: Create `demo/backend/src/app.js`**

```js
const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/todos', require('./routes/todos'));
module.exports = app;
```

- [ ] **Step 4: Create `demo/backend/src/index.js`**

```js
const app = require('./app');
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
```

- [ ] **Step 5: Install dependencies**

```bash
cd demo/backend && npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Commit**

```bash
git add demo/backend/package.json demo/backend/package-lock.json demo/backend/src/app.js demo/backend/src/index.js
git commit -m "feat: scaffold express backend"
```

---

### Task 2: In-memory todo store

**Files:**
- Create: `demo/backend/src/store.js`
- Create: `demo/backend/tests/store.test.js`

- [ ] **Step 1: Write the failing tests**

Create `demo/backend/tests/store.test.js`:

```js
const store = require('../src/store');

beforeEach(() => store.reset());

test('getAll returns empty array initially', () => {
  expect(store.getAll()).toEqual([]);
});

test('create adds a todo with expected shape', () => {
  const todo = store.create('Buy milk');
  expect(todo).toMatchObject({ title: 'Buy milk', completed: false });
  expect(typeof todo.id).toBe('string');
  expect(typeof todo.createdAt).toBe('string');
  expect(store.getAll()).toHaveLength(1);
});

test('toggle flips completed and returns the todo', () => {
  const todo = store.create('Test');
  expect(store.toggle(todo.id).completed).toBe(true);
  expect(store.toggle(todo.id).completed).toBe(false);
});

test('toggle returns null for unknown id', () => {
  expect(store.toggle('999')).toBeNull();
});

test('remove deletes the todo and returns true', () => {
  const todo = store.create('Test');
  expect(store.remove(todo.id)).toBe(true);
  expect(store.getAll()).toHaveLength(0);
});

test('remove returns false for unknown id', () => {
  expect(store.remove('999')).toBe(false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd demo/backend && npm test -- --testPathPattern=store
```

Expected: FAIL — `Cannot find module '../src/store'`

- [ ] **Step 3: Implement `demo/backend/src/store.js`**

```js
let todos = [];
let nextId = 1;

const getAll = () => todos;

const create = (title) => {
  const todo = { id: String(nextId++), title, completed: false, createdAt: new Date().toISOString() };
  todos.push(todo);
  return todo;
};

const toggle = (id) => {
  const todo = todos.find(t => t.id === id);
  if (!todo) return null;
  todo.completed = !todo.completed;
  return todo;
};

const remove = (id) => {
  const idx = todos.findIndex(t => t.id === id);
  if (idx === -1) return false;
  todos.splice(idx, 1);
  return true;
};

const reset = () => { todos = []; nextId = 1; };

module.exports = { getAll, create, toggle, remove, reset };
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd demo/backend && npm test -- --testPathPattern=store
```

Expected: PASS — 6 tests

- [ ] **Step 5: Commit**

```bash
git add demo/backend/src/store.js demo/backend/tests/store.test.js
git commit -m "feat: add in-memory todo store with tests"
```

---

### Task 3: Todo routes

**Files:**
- Create: `demo/backend/src/routes/todos.js`
- Create: `demo/backend/tests/todos.test.js`

- [ ] **Step 1: Write failing integration tests**

Create `demo/backend/tests/todos.test.js`:

```js
const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store');

beforeEach(() => store.reset());

describe('GET /api/todos', () => {
  it('returns empty array initially', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns created todos', async () => {
    store.create('Buy milk');
    const res = await request(app).get('/api/todos');
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Buy milk');
  });
});

describe('POST /api/todos', () => {
  it('creates a todo and returns 201', async () => {
    const res = await request(app).post('/api/todos').send({ title: 'Buy milk' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Buy milk', completed: false });
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/todos').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('title is required');
  });

  it('returns 400 when title is blank', async () => {
    const res = await request(app).post('/api/todos').send({ title: '   ' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/todos/:id', () => {
  it('toggles completed to true', async () => {
    const created = store.create('Test');
    const res = await request(app).patch(`/api/todos/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).patch('/api/todos/999');
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/todos/:id', () => {
  it('deletes a todo and returns 204', async () => {
    const created = store.create('Test');
    const res = await request(app).delete(`/api/todos/${created.id}`);
    expect(res.status).toBe(204);
    expect(store.getAll()).toHaveLength(0);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).delete('/api/todos/999');
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd demo/backend && npm test -- --testPathPattern=todos
```

Expected: FAIL — `Cannot find module './routes/todos'`

- [ ] **Step 3: Implement `demo/backend/src/routes/todos.js`**

```js
const express = require('express');
const store = require('../store');
const router = express.Router();

router.get('/', (req, res) => res.json(store.getAll()));

router.post('/', (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  res.status(201).json(store.create(title.trim()));
});

router.patch('/:id', (req, res) => {
  const todo = store.toggle(req.params.id);
  if (!todo) return res.status(404).json({ error: 'not found' });
  res.json(todo);
});

router.delete('/:id', (req, res) => {
  const ok = store.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

module.exports = router;
```

- [ ] **Step 4: Run all backend tests**

```bash
cd demo/backend && npm test
```

Expected: PASS — 11 tests across both test files

- [ ] **Step 5: Commit**

```bash
git add demo/backend/src/routes/todos.js demo/backend/tests/todos.test.js
git commit -m "feat: add todo REST routes with tests"
```

---

### Task 4: Scaffold frontend

**Files:**
- Create: `demo/frontend/` (Vite project)
- Modify: `demo/frontend/vite.config.js`

- [ ] **Step 1: Scaffold Vite + React project**

```bash
cd demo && npm create vite@latest frontend -- --template react
```

- [ ] **Step 2: Install dependencies including React Query**

```bash
cd demo/frontend && npm install && npm install @tanstack/react-query
```

Expected: no errors.

- [ ] **Step 3: Replace `demo/frontend/vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
```

- [ ] **Step 4: Verify dev server starts**

```bash
cd demo/frontend && npm run dev
```

Expected: `VITE v5.x.x  ready` at `http://localhost:5173`. Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add demo/frontend/
git commit -m "feat: scaffold vite react frontend with react-query"
```

---

### Task 5: API client

**Files:**
- Create: `demo/frontend/src/api/todos.js`

- [ ] **Step 1: Remove Vite boilerplate files**

```bash
rm -rf demo/frontend/src/assets demo/frontend/src/App.css demo/frontend/src/index.css
```

- [ ] **Step 2: Create `demo/frontend/src/api/todos.js`**

```js
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
```

- [ ] **Step 3: Commit**

```bash
git add demo/frontend/src/api/todos.js
git commit -m "feat: add todo API client"
```

---

### Task 6: AddTodo component

**Files:**
- Create: `demo/frontend/src/components/AddTodo.jsx`

- [ ] **Step 1: Create `demo/frontend/src/components/AddTodo.jsx`**

```jsx
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a todo..."
        style={{ flex: 1, padding: 8 }}
      />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add demo/frontend/src/components/AddTodo.jsx
git commit -m "feat: add AddTodo component"
```

---

### Task 7: TodoItem component

**Files:**
- Create: `demo/frontend/src/components/TodoItem.jsx`

- [ ] **Step 1: Create `demo/frontend/src/components/TodoItem.jsx`**

```jsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleTodo, deleteTodo } from '../api/todos';

export default function TodoItem({ todo }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['todos'] });

  const { mutate: toggle } = useMutation({
    mutationFn: () => toggleTodo(todo.id),
    onSuccess: invalidate,
  });

  const { mutate: remove } = useMutation({
    mutationFn: () => deleteTodo(todo.id),
    onSuccess: invalidate,
  });

  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggle()}
      />
      <span style={{ flex: 1, textDecoration: todo.completed ? 'line-through' : 'none' }}>
        {todo.title}
      </span>
      <button onClick={() => remove()}>Delete</button>
    </li>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add demo/frontend/src/components/TodoItem.jsx
git commit -m "feat: add TodoItem component"
```

---

### Task 8: TodoList component

**Files:**
- Create: `demo/frontend/src/components/TodoList.jsx`

- [ ] **Step 1: Create `demo/frontend/src/components/TodoList.jsx`**

```jsx
import { useQuery } from '@tanstack/react-query';
import { fetchTodos } from '../api/todos';
import TodoItem from './TodoItem';

export default function TodoList() {
  const { data: todos, isLoading, isError } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading todos. Is the backend running?</p>;
  if (!todos.length) return <p>No todos yet. Add one above!</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add demo/frontend/src/components/TodoList.jsx
git commit -m "feat: add TodoList component"
```

---

### Task 9: Wire up App and verify end-to-end

**Files:**
- Modify: `demo/frontend/src/main.jsx`
- Modify: `demo/frontend/src/App.jsx`

- [ ] **Step 1: Replace `demo/frontend/src/main.jsx`**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

- [ ] **Step 2: Replace `demo/frontend/src/App.jsx`**

```jsx
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
```

- [ ] **Step 3: Start backend**

In one terminal:
```bash
cd demo/backend && npm start
```

Expected: `Backend running on http://localhost:3001`

- [ ] **Step 4: Start frontend in a separate terminal**

```bash
cd demo/frontend && npm run dev
```

Expected: Vite server at `http://localhost:5173`

- [ ] **Step 5: Verify end-to-end manually**

Open `http://localhost:5173`:
- App loads showing "No todos yet. Add one above!"
- Type a title and click Add — todo appears in list
- Check the checkbox — title gets strikethrough
- Click Delete — item is removed

- [ ] **Step 6: Commit**

```bash
git add demo/frontend/src/main.jsx demo/frontend/src/App.jsx
git commit -m "feat: wire up app with QueryClientProvider"
```

---

### Task 10: Update .gitignore and push

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add node_modules to root .gitignore**

```bash
grep -q 'node_modules' .gitignore || echo 'node_modules/' >> .gitignore
```

- [ ] **Step 2: Verify node_modules are not staged**

```bash
git status demo/
```

Expected: no `node_modules` entries shown.

- [ ] **Step 3: Commit and push**

```bash
git add .gitignore
git commit -m "chore: ignore node_modules"
git push
```

Expected: all commits pushed to `origin/main`.
