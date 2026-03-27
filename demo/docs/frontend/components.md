# Frontend Components

## api/todos.js

Fetch wrappers for all backend endpoints. All functions use a `checkOk` helper that throws on non-2xx responses.

| Export | Method | Endpoint |
|--------|--------|----------|
| `fetchTodos()` | GET | `/api/todos` |
| `createTodo(title)` | POST | `/api/todos` |
| `toggleTodo(id)` | PATCH | `/api/todos/:id` |
| `deleteTodo(id)` | DELETE | `/api/todos/:id` |

---

## AddTodo

**File:** `src/components/AddTodo.jsx`

**Responsibility:** Render a form to create a new todo.

**Behaviour:**
- Controlled `<input>` bound to local `title` state
- On submit: calls `createTodo(title.trim())` via `useMutation`
- On success: invalidates `['todos']` query, clears the input
- Button shows "Adding..." and is disabled while the mutation is pending

---

## TodoList

**File:** `src/components/TodoList.jsx`

**Responsibility:** Fetch and render the full list of todos.

**Behaviour:**
- `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })`
- Renders `<p>Loading...</p>` while loading
- Renders `<p>Error loading todos. Is the backend running?</p>` on error
- Renders `<p>No todos yet. Add one above!</p>` when the list is empty
- Renders a `<ul>` of `<TodoItem>` components otherwise

---

## TodoItem

**File:** `src/components/TodoItem.jsx`

**Props:** `{ todo: { id, title, completed, createdAt } }`

**Responsibility:** Render a single todo row with toggle and delete controls.

**Behaviour:**
- Checkbox calls `toggleTodo(todo.id)` via `useMutation`, invalidates `['todos']` on success
- Delete button calls `deleteTodo(todo.id)` via `useMutation`, invalidates `['todos']` on success
- Title has `text-decoration: line-through` when `todo.completed` is true
