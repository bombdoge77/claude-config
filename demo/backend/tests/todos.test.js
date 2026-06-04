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

describe('POST /api/todos/bulk-complete', () => {
  it('marks matched todos as completed and returns 200 with array', async () => {
    const a = store.create('Buy milk');
    const b = store.create('Call dentist');
    const res = await request(app)
      .post('/api/todos/bulk-complete')
      .send({ ids: [a.id, b.id] });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ id: a.id, completed: true });
    expect(res.body[1]).toMatchObject({ id: b.id, completed: true });
  });

  it('silently skips unknown ids and returns matched ones', async () => {
    const a = store.create('Buy milk');
    const res = await request(app)
      .post('/api/todos/bulk-complete')
      .send({ ids: [a.id, '999'] });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(a.id);
  });

  it('is idempotent for already-completed todos', async () => {
    const a = store.create('Buy milk');
    store.bulkComplete([a.id]);
    const res = await request(app)
      .post('/api/todos/bulk-complete')
      .send({ ids: [a.id] });
    expect(res.status).toBe(200);
    expect(res.body[0].completed).toBe(true);
  });

  it('returns 400 when ids is missing', async () => {
    const res = await request(app).post('/api/todos/bulk-complete').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ids must be a non-empty array');
  });

  it('returns 400 when ids is not an array', async () => {
    const res = await request(app)
      .post('/api/todos/bulk-complete')
      .send({ ids: '1' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ids must be a non-empty array');
  });

  it('returns 400 when ids is an empty array', async () => {
    const res = await request(app)
      .post('/api/todos/bulk-complete')
      .send({ ids: [] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ids must be a non-empty array');
  });

  it('returns 404 when no provided ids match any todo', async () => {
    const res = await request(app)
      .post('/api/todos/bulk-complete')
      .send({ ids: ['999', '888'] });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('no todos found for provided ids');
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
