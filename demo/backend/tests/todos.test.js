const request = require('supertest');
const app = require('../src/app');
const store = require('../src/store');

beforeEach(() => store.reset());

describe('GET /api/todos', () => {
  it('returns empty array initially', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns created todos', async () => {
    store.create('Buy milk');
    const res = await request(app).get('/api/todos');
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Buy milk');
  });
});

describe('POST /api/todos', () => {
  it('creates a todo and returns 201', async () => {
    const res = await request(app).post('/api/todos').send({ title: 'Buy milk' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Buy milk', completed: false, notes: '' });
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/todos').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('title is required');
  });

  it('returns 400 when title is blank', async () => {
    const res = await request(app).post('/api/todos').send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('title is required');
  });
});

describe('PATCH /api/todos/:id', () => {
  it('toggles completed to true', async () => {
    const created = store.create('Test');
    const res = await request(app).patch(`/api/todos/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).patch('/api/todos/999');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/todos/:id/notes', () => {
  const patchNotes = (id, body) => request(app).patch(`/api/todos/${id}/notes`).send(body);

  it('updates notes and returns the full todo', async () => {
    const created = store.create('Test');
    const res = await patchNotes(created.id, { notes: 'From the organic store' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: created.id, title: 'Test', completed: false, notes: 'From the organic store' });
    expect(res.body.createdAt).toBe(created.createdAt);
  });

  it('persists notes so GET returns them', async () => {
    const created = store.create('Test');
    await patchNotes(created.id, { notes: 'hello' });
    const res = await request(app).get('/api/todos');
    expect(res.body[0].notes).toBe('hello');
  });

  it('clears notes with an empty string', async () => {
    const created = store.create('Test');
    store.setNotes(created.id, 'old');
    const res = await patchNotes(created.id, { notes: '' });
    expect(res.status).toBe(200);
    expect(res.body.notes).toBe('');
  });

  it('stores notes as-is without trimming', async () => {
    const created = store.create('Test');
    const res = await patchNotes(created.id, { notes: '  padded  \n' });
    expect(res.body.notes).toBe('  padded  \n');
  });

  it('ignores other fields in the body', async () => {
    const created = store.create('Test');
    const res = await patchNotes(created.id, { notes: 'x', title: 'Hacked', completed: true });
    expect(res.body).toMatchObject({ title: 'Test', completed: false, notes: 'x' });
  });

  it('accepts notes of exactly 2000 characters', async () => {
    const created = store.create('Test');
    const res = await patchNotes(created.id, { notes: 'a'.repeat(2000) });
    expect(res.status).toBe(200);
  });

  it('returns 400 when notes is longer than 2000 characters', async () => {
    const created = store.create('Test');
    const res = await patchNotes(created.id, { notes: 'a'.repeat(2001) });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('notes must be at most 2000 characters');
  });

  it('returns 400 when notes is missing', async () => {
    const created = store.create('Test');
    const res = await patchNotes(created.id, {});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('notes must be a string');
  });

  it('returns 400 when notes is not a string', async () => {
    const created = store.create('Test');
    const res = await patchNotes(created.id, { notes: 42 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('notes must be a string');
  });

  it('returns 404 for unknown id', async () => {
    const res = await patchNotes('999', { notes: 'x' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('not found');
  });
});

describe('DELETE /api/todos/:id', () => {
  it('deletes a todo and returns 204', async () => {
    const created = store.create('Test');
    const res = await request(app).delete(`/api/todos/${created.id}`);
    expect(res.status).toBe(204);
    expect(store.getAll()).toHaveLength(0);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).delete('/api/todos/999');
    expect(res.status).toBe(404);
  });
});
