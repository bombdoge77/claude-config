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
    expect(res.body).toMatchObject({ title: 'Buy milk', completed: false });
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
