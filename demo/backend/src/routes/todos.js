const express = require('express');
const store = require('../store');
const router = express.Router();

router.get('/', (req, res) => res.json(store.getAll()));

router.post('/', (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  res.status(201).json(store.create(title.trim()));
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
