# Backend API Reference

Base URL: `http://localhost:3001`

All request and response bodies are JSON.

---

## GET /api/todos

Returns all todos.

**Response** `200 OK`
```json
[
  { "id": "1", "title": "Buy milk", "completed": false, "createdAt": "2026-03-27T10:00:00.000Z" }
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
{ "id": "1", "title": "Buy milk", "completed": false, "createdAt": "2026-03-27T10:00:00.000Z" }
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
{ "id": "1", "title": "Buy milk", "completed": true, "createdAt": "2026-03-27T10:00:00.000Z" }
```

**Error** `404 Not Found`
```json
{ "error": "not found" }
```

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
| `createdAt` | string | ISO 8601 timestamp |
