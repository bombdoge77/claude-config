# Demo Docs — Design Spec

**Date:** 2026-03-27
**Status:** Approved

## Overview

Add a `demo/docs/` directory with project documentation organised into backend and frontend subdirectories, plus an `index.md` TOC that agents read at session start to orient themselves. The project `CLAUDE.md` is updated to instruct agents to read the index on session start and update it when docs change.

## Folder Structure

```
demo/docs/
├── index.md               — TOC: lists every doc with path + one-line description + tags
├── backend/
│   ├── architecture.md    — stack, layers, request flow, in-memory storage rationale
│   └── api.md             — all 4 REST endpoints with method, path, body, responses
└── frontend/
    ├── architecture.md    — Vite, React Query, component tree, data flow
    └── components.md      — each component's responsibility, props, mutations used
```

## index.md Format

A markdown table with three columns: doc path (linked), description, tags.

```markdown
# Demo Docs Index

| Doc | Description | Tags |
|-----|-------------|------|
| [backend/architecture.md](backend/architecture.md) | Stack, layers, request flow, storage | backend, architecture |
| [backend/api.md](backend/api.md) | REST endpoints, request/response shapes | backend, api, endpoints |
| [frontend/architecture.md](frontend/architecture.md) | Vite setup, React Query data flow | frontend, architecture |
| [frontend/components.md](frontend/components.md) | Component responsibilities and props | frontend, components, react |
```

When a doc is added or renamed, the agent making the change also updates this table.

## CLAUDE.md Addition

New section appended to the project `CLAUDE.md`:

```markdown
## Demo Docs

The `demo/docs/` directory contains project documentation.
`demo/docs/index.md` is a table of contents — read it at the start of every session
to orient yourself before touching demo code.

At the end of a session where you added or changed docs, update `index.md` to
reflect any new or renamed files.
```

## Doc Contents (summary)

**backend/architecture.md** — Node.js + Express stack, separation of app.js (no listen) vs index.js, store module for in-memory state, routes layer, test setup with Jest + Supertest.

**backend/api.md** — Full reference for all 4 endpoints: GET /api/todos, POST /api/todos, PATCH /api/todos/:id, DELETE /api/todos/:id. Includes request body, response shape, and status codes.

**frontend/architecture.md** — Vite + React, @tanstack/react-query v5, proxy config (`/api` → localhost:3001), QueryClientProvider setup, React Query as sole state manager.

**frontend/components.md** — AddTodo (form + POST mutation), TodoList (useQuery), TodoItem (toggle + delete mutations), plus the api/todos.js fetch wrappers.
