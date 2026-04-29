const { createApp } = require('./src/index');
const { migrate } = require('./src/config/migrate');
const { seed } = require('./src/config/seed');
const PORT = 3001;

migrate();
seed();

const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;
