const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/todos', require('./routes/todos'));
module.exports = app;
