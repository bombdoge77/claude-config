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

**Responsibility:** Fetch and render the full list of todos. Manages multi-select mode for bulk completion.

**State:**
- `selectionMode` (boolean, default `false`) — whether selection checkboxes are visible
- `selectedIds` (Set, default `new Set()`) — IDs of todos currently selected

**Behaviour:**
- `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })`
- Renders `loading...` / `backend unreachable` / `no tasks yet` state messages
- Renders a toolbar above the list with a "select" / "cancel" toggle button
- In selection mode, passes `selected` and `onToggleSelect` props to each `TodoItem`
- When at least one item is selected, shows a "complete selected (N)" button in the toolbar
- "complete selected" button: calls `bulkComplete([...selectedIds])` via `useMutation`; shows "completing…" and is disabled while pending
- On bulk complete success: invalidates `['todos']`, clears `selectedIds`, exits selection mode
- "cancel" button (or successful completion) exits selection mode and clears selection

---

## TodoItem

**File:** `src/components/TodoItem.jsx`

**Props:**
- `todo: { id, title, completed, createdAt }` — the todo object
- `selected` (boolean, default `false`) — whether this item is selected in bulk-select mode
- `onToggleSelect` (function | undefined) — when provided, renders a selection checkbox; `onChange` calls `onToggleSelect(todo.id)`

**Responsibility:** Render a single todo row with toggle, delete, and optional selection controls.

**Behaviour:**
- Completion checkbox calls `toggleTodo(todo.id)` via `useMutation`, invalidates `['todos']` on success
- Delete button calls `deleteTodo(todo.id)` via `useMutation`, invalidates `['todos']` on success
- Title has `text-decoration: line-through` when `todo.completed` is true
- When `onToggleSelect` is provided and `todo.completed` is false, a square selection checkbox (`.todo-select-checkbox`) is rendered on the left of the row
- Already-completed todos do not show the selection checkbox (cannot be bulk-selected)
