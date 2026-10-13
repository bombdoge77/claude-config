# Backend API Reference

Base URL: `http://localhost:3001`

All request and response bodies are JSON.

---

## GET /api/todos

Returns all todos.

**Response** `200 OK`
```json
[
  { "id": "1", "title": "Buy milk", "completed": false, "notes": "", "createdAt": "2026-03-27T10:00:00.000Z" }
]
```

Returns an empty array `[]` if no todos exist.

---

## POST /api/todos

Creates a new todo.

**Request body**
```json
{ "title": "Buy milk" }
```

**Response** `201 Created`
```json
{ "id": "1", "title": "Buy milk", "completed": false, "notes": "", "createdAt": "2026-03-27T10:00:00.000Z" }
```

**Error** `400 Bad Request` — if `title` is missing or blank
```json
{ "error": "title is required" }
```

---

## PATCH /api/todos/:id

Toggles the `completed` field of a todo.

**Response** `200 OK`
```json
{ "id": "1", "title": "Buy milk", "completed": true, "notes": "", "createdAt": "2026-03-27T10:00:00.000Z" }
```

**Error** `404 Not Found`
```json
{ "error": "not found" }
```

---

## PATCH /api/todos/:id/notes

Replaces a todo's notes.

**Request body**
```json
{ "notes": "From the organic store" }
```

- `notes` must be a string of at most 2000 characters. An empty string `""` clears the notes.
- The value is stored as-is (not trimmed).
- Other fields in the body are ignored.

**Response** `200 OK` — the full updated todo
```json
{ "id": "1", "title": "Buy milk", "completed": false, "notes": "From the organic store", "createdAt": "2026-03-27T10:00:00.000Z" }
```

**Errors**

| Status | When | Body |
|--------|------|------|
| `400` | `notes` is missing or not a string | `{ "error": "notes must be a string" }` |
| `400` | `notes` is longer than 2000 characters | `{ "error": "notes must be at most 2000 characters" }` |
| `404` | No todo with that `id` | `{ "error": "not found" }` |

---

## DELETE /api/todos/:id

Deletes a todo.

**Response** `204 No Content` — no body

**Error** `404 Not Found`
```json
{ "error": "not found" }
```

---

## Todo Shape

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Auto-incremented numeric ID as string |
| `title` | string | Todo text, trimmed on creation |
| `completed` | boolean | Whether the todo is done |
| `notes` | string | Free-text notes, defaults to `""`, max 2000 characters |
| `createdAt` | string | ISO 8601 timestamp |
