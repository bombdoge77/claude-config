# Backend Architecture

## Stack

- **Runtime:** Node.js
- **Framework:** Express 4.x
- **Testing:** Jest + Supertest
- **Storage:** In-memory (no database)

## Structure

```
backend/
├── src/
│   ├── app.js          — Express app setup, middleware, route mounting (no listen)
│   ├── index.js        — Imports app, starts HTTP server on port 3001
│   ├── store.js        — In-memory todo state with CRUD operations
│   └── routes/
│       └── todos.js    — REST route handlers for /api/todos
└── tests/
    ├── store.test.js   — Unit tests for store module
    └── todos.test.js   — Integration tests via supertest
```

## Key Design Decisions

**app.js exports without listening.** The Express app is defined in `app.js` and exported without calling `.listen()`. `index.js` does the actual listen. This allows `tests/todos.test.js` to import the app directly via supertest without binding a port.

**In-memory store.** Todos are kept in a module-scoped array in `store.js`. State is lost on server restart. The `reset()` export is used by tests via `beforeEach` for isolation.

**Store returns copies.** `getAll()` returns `[...todos]` and `toggle()` returns `{ ...todo }` to prevent callers from accidentally mutating internal state.

## Request Flow

```
HTTP Request
  → Express (app.js)
    → express.json() middleware
      → /api/todos router (routes/todos.js)
        → store.js (getAll / create / toggle / remove)
          → JSON response
```
