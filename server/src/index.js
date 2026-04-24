const express = require('express');
const cors = require('cors');
const session = require('express-session');
const routes = require('./routes');

const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(session({
    secret: 'farm-inventory-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000,
      sameSite: 'lax'
    }
  }));

  app.use('/api', routes);

  return app;
};

module.exports = { createApp };