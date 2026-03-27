# Frontend Architecture

## Stack

- **Bundler:** Vite 5+
- **Framework:** React 18
- **Data fetching / state:** @tanstack/react-query v5
- **Styling:** Inline styles (demo only)

## Structure

```
frontend/
├── src/
│   ├── main.jsx              — Entry point, mounts QueryClientProvider + App
│   ├── App.jsx               — Root layout: renders AddTodo + TodoList
│   ├── api/
│   │   └── todos.js          — fetch wrappers for all backend endpoints
│   └── components/
│       ├── AddTodo.jsx       — Form to create a new todo
│       ├── TodoList.jsx      — Fetches and renders the list of todos
│       └── TodoItem.jsx      — Single todo row with toggle + delete
└── vite.config.js            — Vite config with /api proxy to localhost:3001
```

## Key Design Decisions

**React Query as sole state manager.** There is no Redux, Context API, or local state beyond the input field in AddTodo. The React Query cache at queryKey `['todos']` is the single source of truth. All mutations call `queryClient.invalidateQueries({ queryKey: ['todos'] })` on success to trigger a refetch.

**Vite proxy eliminates CORS.** `vite.config.js` proxies all `/api` requests to `http://localhost:3001`. The frontend uses relative paths (e.g. `/api/todos`) and never hard-codes a backend URL.

**HTTP errors are explicit.** The `checkOk` helper in `api/todos.js` throws on non-2xx responses so React Query correctly enters the error state rather than silently rendering error JSON as todo data.

## Data Flow

```
User action (form submit / checkbox / delete button)
  → useMutation (AddTodo / TodoItem)
    → api/todos.js fetch wrapper
      → backend REST API
        → onSuccess: invalidateQueries(['todos'])
          → useQuery refetch (TodoList)
            → re-render
```
