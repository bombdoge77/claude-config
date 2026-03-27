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
