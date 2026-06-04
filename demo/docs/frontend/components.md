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

**Responsibility:** Fetch and render the full list of todos, with optional multi-select and bulk-complete.

**State:**
- `selectionMode` (boolean) — whether selection checkboxes are shown
- `selectedIds` (Set) — IDs of currently selected (not-yet-completed) todos

**Behaviour:**
- `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })`
- Renders `<p>loading...</p>` while loading
- Renders `<p>backend unreachable</p>` on error
- Renders `<p>no tasks yet</p>` when the list is empty
- Renders a toolbar above the list with a "select" / "cancel" toggle button
- In selection mode each `TodoItem` receives `selected` and `onToggleSelect` props; completed todos receive `onToggleSelect: undefined` so their selection checkbox is hidden
- When `selectedIds.size > 0`, a "complete selected (N)" button appears in the toolbar; it calls `bulkComplete(ids)` via `useMutation`, shows "completing…" and is disabled while pending
- On bulk-complete success: invalidates `['todos']`, clears `selectedIds`, exits selection mode

---

## TodoItem

**File:** `src/components/TodoItem.jsx`

**Props:** `{ todo: { id, title, completed, createdAt }, selected?: boolean, onToggleSelect?: (id: string) => void }`

**Responsibility:** Render a single todo row with toggle, delete, and optional selection controls.

**Behaviour:**
- Circular checkbox calls `toggleTodo(todo.id)` via `useMutation`, invalidates `['todos']` on success
- Delete button calls `deleteTodo(todo.id)` via `useMutation`, invalidates `['todos']` on success
- Title has `text-decoration: line-through` when `todo.completed` is true
- When `onToggleSelect` is provided (selection mode and todo not completed), a square selection checkbox is rendered to the left of the circular checkbox; checking/unchecking calls `onToggleSelect(todo.id)`
