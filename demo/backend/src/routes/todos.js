const express = require('express');
const store = require('../store');
const router = express.Router();

const MAX_TITLE_LENGTH = 200;

router.get('/', (req, res) => res.json(store.getAll()));

router.post('/', (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const trimmed = title.trim();
  if (trimmed.length > MAX_TITLE_LENGTH) {
    return res.status(400).json({ error: `title must be ${MAX_TITLE_LENGTH} characters or fewer` });
  }
  res.status(201).json(store.create(trimmed));
});

router.patch('/:id', (req, res) => {
  const todo = store.toggle(req.params.id);
  if (!todo) return res.status(404).json({ error: 'not found' });
  res.json(todo);
});

router.delete('/:id', (req, res) => {
  const ok = store.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

module.exports = router;
