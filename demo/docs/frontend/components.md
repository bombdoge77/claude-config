# Frontend Components

## api/todos.js

Fetch wrappers for all backend endpoints. All functions use a `checkOk` helper that throws on non-2xx responses.

| Export | Method | Endpoint |
|--------|--------|----------|
| `fetchTodos()` | GET | `/api/todos` |
| `createTodo(title)` | POST | `/api/todos` |
| `toggleTodo(id)` | PATCH | `/api/todos/:id` |
| `updateNotes(id, notes)` | PATCH | `/api/todos/:id/notes` |
| `deleteTodo(id)` | DELETE | `/api/todos/:id` |

---

## App

**File:** `src/App.jsx`

**Responsibility:** Root layout and todo selection.

**Behaviour:**
- Holds `selectedId` state and resolves it against the `['todos']` query
- Switches to a two-column layout (`.app--with-panel`) and renders `<TodoDetailPanel>` when a todo is selected
- Keys the panel by todo id so switching todos resets the notes draft

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

**Props:** `{ selectedId, onSelect(id | null) }`

**Responsibility:** Fetch and render the full list of todos.

**Behaviour:**
- `useQuery({ queryKey: ['todos'], queryFn: fetchTodos })`
- Renders `<p>Loading...</p>` while loading
- Renders `<p>Error loading todos. Is the backend running?</p>` on error
- Renders `<p>No todos yet. Add one above!</p>` when the list is empty
- Renders a `<ul>` of `<TodoItem>` components otherwise, passing `selected` and `onSelect` through

---

## TodoItem

**File:** `src/components/TodoItem.jsx`

**Props:** `{ todo: { id, title, completed, notes, createdAt }, selected, onSelect }`

**Responsibility:** Render a single todo row with toggle and delete controls.

**Behaviour:**
- Checkbox calls `toggleTodo(todo.id)` via `useMutation`, invalidates `['todos']` on success
- Delete button calls `deleteTodo(todo.id)` via `useMutation`, invalidates `['todos']` on success, and clears the selection if this todo was selected
- Title is a `<button>`: clicking it or pressing Enter calls `onSelect(todo.id)`
- Title has `text-decoration: line-through` when `todo.completed` is true
- Shows a gold indicator dot when `todo.notes` is non-empty
- When `selected`, gets a gold border and a gold tab on its right edge (`.todo-item--selected`)

---

## TodoDetailPanel

**File:** `src/components/TodoDetailPanel.jsx`

**Props:** `{ todo, onClose }`

**Responsibility:** Show a todo's title, created date ("Created Mar 30, 2026"), completion checkbox, and an editable notes textarea.

**Behaviour:**
- Notes textarea holds a local draft (max 2000 characters)
- Saves via `updateNotes` on Save click and on textarea blur. If the draft matches the last saved value, no request is sent
- Save button shows "Saving…" and is disabled while pending
- A failed save shows an inline error and keeps the draft
- Closes via `×` or Escape. Unsaved edits are saved first, and the panel stays open if that save fails
- Checkbox calls `toggleTodo` and invalidates `['todos']`
