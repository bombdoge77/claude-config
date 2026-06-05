const store = require('../src/store');

beforeEach(() => store.reset());

test('getAll returns empty array initially', () => {
  expect(store.getAll()).toEqual([]);
});

test('create adds a todo with expected shape', () => {
  const todo = store.create('Buy milk');
  expect(todo).toMatchObject({ title: 'Buy milk', completed: false });
  expect(typeof todo.id).toBe('string');
  expect(typeof todo.createdAt).toBe('string');
  expect(store.getAll()).toHaveLength(1);
});

test('toggle flips completed and returns the todo', () => {
  const todo = store.create('Test');
  expect(store.toggle(todo.id).completed).toBe(true);
  expect(store.toggle(todo.id).completed).toBe(false);
});

test('toggle returns null for unknown id', () => {
  expect(store.toggle('999')).toBeNull();
});

test('remove deletes the todo and returns true', () => {
  const todo = store.create('Test');
  expect(store.remove(todo.id)).toBe(true);
  expect(store.getAll()).toHaveLength(0);
});

test('remove returns false for unknown id', () => {
  expect(store.remove('999')).toBe(false);
});

test('bulkComplete marks matching todos as completed and returns them', () => {
  const a = store.create('Buy milk');
  const b = store.create('Call dentist');
  store.create('Walk dog');
  const result = store.bulkComplete([a.id, b.id]);
  expect(result).toHaveLength(2);
  expect(result[0]).toMatchObject({ id: a.id, completed: true });
  expect(result[1]).toMatchObject({ id: b.id, completed: true });
});

test('bulkComplete is idempotent for already-completed todos', () => {
  const a = store.create('Buy milk');
  store.toggle(a.id); // mark completed
  const result = store.bulkComplete([a.id]);
  expect(result).toHaveLength(1);
  expect(result[0].completed).toBe(true);
});

test('bulkComplete silently skips unknown ids', () => {
  const a = store.create('Buy milk');
  const result = store.bulkComplete([a.id, '999']);
  expect(result).toHaveLength(1);
  expect(result[0].id).toBe(a.id);
});

test('bulkComplete returns empty array when no ids match', () => {
  store.create('Buy milk');
  const result = store.bulkComplete(['999', '888']);
  expect(result).toEqual([]);
});
