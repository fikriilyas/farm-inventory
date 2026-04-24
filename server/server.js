const { createApp } = require('./src/index');
const { migrate } = require('./src/config/migrate');
const { seed } = require('./src/config/seed');

const PORT = 3001;

migrate();
seed();

const app = createApp();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});