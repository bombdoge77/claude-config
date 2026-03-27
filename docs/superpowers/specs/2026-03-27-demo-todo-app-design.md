# Demo Todo App — Design Spec

**Date:** 2026-03-27
**Status:** Approved

## Overview

A simple full-stack todo app demonstrating real frontend↔backend HTTP communication. Lives at `claude-config/demo/`. No deployment, no database, no auth — pure demo.

## Structure

```
claude-config/demo/
├── frontend/     # Vite + React + React Query
└── backend/      # Node.js + Express
```

- Frontend: `localhost:5173`
- Backend: `localhost:3001`
- Vite proxies `/api` → backend (no CORS config needed)

## Backend

**Runtime:** Node.js + Express
**Storage:** In-memory array (no database)

### Todo shape

```ts
{ id: string, title: string, completed: boolean, createdAt: string }
```

### Routes

| Method | Path             | Description              |
|--------|------------------|--------------------------|
| GET    | /api/todos       | List all todos           |
| POST   | /api/todos       | Create todo `{ title }`  |
| PATCH  | /api/todos/:id   | Toggle completed         |
| DELETE | /api/todos/:id   | Delete todo              |

Validation: reject POST if `title` is missing or empty.

## Frontend

**Stack:** Vite + React + React Query (`@tanstack/react-query`)

### Components

- **`AddTodo`** — controlled input + submit button; `useMutation` to POST; invalidates todo list query on success
- **`TodoList`** — `useQuery` to fetch all todos; renders loading/error states; maps to `TodoItem`
- **`TodoItem`** — checkbox (toggle via `useMutation` PATCH) + delete button (`useMutation` DELETE); both invalidate list on success

React Query cache is the sole source of truth — no additional global state.
