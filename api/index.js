const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// Increase JSON payload limit since we might send large arrays
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Prefix all routes with /api
app.use('/api', routes);

// Base route for health check
app.get('/api', (req, res) => {
  res.json({ message: 'Mess Meal Tracker API is running' });
});

module.exports = app;
