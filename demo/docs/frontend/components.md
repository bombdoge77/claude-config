# Frontend Components

## api/todos.js

Fetch wrappers for all backend endpoints. All functions use a `checkOk` helper that throws on non-2xx responses.

| Export | Method | Endpoint |
|--------|--------|----------|
| `fetchTodos()` | GET | `/api/todos` |
| `createTodo(title)` | POST | `/api/todos` |
| `toggleTodo(id)` | PATCH | `/api/todos/:id` |
| `deleteTodo(id)` | DELETE | `/api/todos/:id` |
| `bulkComplete(ids)` | POST | `/api/todos/bulk-complete` |

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

**Responsibility:** Fetch and render the full list of todos, with optional multi-select bulk-complete mode.

**State:**
- `selectionMode` (boolean, default `false`) — whether selection checkboxes are visible
- `selectedIds` (Set, default empty) — IDs of todos currently checked for bulk action

**Behaviour:**
- `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })`
- Renders `loading...` while loading
- Renders `backend unreachable` on error
- Renders `no tasks yet` when the list is empty
- Renders a toolbar above the list with:
  - A **"select"** / **"cancel"** toggle button to enter/exit selection mode
  - A **"complete selected (N)"** button (only when `selectedIds.size > 0`) that calls `bulkComplete([...selectedIds])` via `useMutation`
- On bulk-complete success: invalidates `['todos']`, clears `selectedIds`, exits selection mode
- The bulk button shows "completing…" and is disabled while the mutation is pending
- In selection mode, passes `selected` and `onToggleSelect` props to each `TodoItem`
- Exiting selection mode (toggle button or successful mutation) clears `selectedIds`

---

## TodoItem

**File:** `src/components/TodoItem.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `todo` | `{ id, title, completed, createdAt }` | required | The todo data |
| `selected` | boolean | `false` | Whether this item is checked in selection mode |
| `onToggleSelect` | function \| undefined | `undefined` | When provided, selection mode is active; called with `todo.id` on checkbox change |

**Responsibility:** Render a single todo row with toggle, delete, and optional selection controls.

**Behaviour:**
- Circular toggle checkbox calls `toggleTodo(todo.id)` via `useMutation`, invalidates `['todos']` on success
- Delete button calls `deleteTodo(todo.id)` via `useMutation`, invalidates `['todos']` on success
- Title has `text-decoration: line-through` when `todo.completed` is true
- When `onToggleSelect` is provided and `todo.completed` is false, a small square selection checkbox (`.todo-select-check`) is rendered to the left of the row; `onChange` calls `onToggleSelect(todo.id)`
- Already-completed todos do not show the selection checkbox (they cannot be bulk-completed)
