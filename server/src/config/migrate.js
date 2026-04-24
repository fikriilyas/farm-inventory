const db = require('./database');

const migrate = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      color TEXT DEFAULT '#22c55e',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      purchase_price REAL NOT NULL DEFAULT 0,
      selling_price REAL NOT NULL DEFAULT 0,
      unit TEXT DEFAULT 'pcs',
      category_id INTEGER,
      low_stock_threshold INTEGER DEFAULT 10,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'officer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  migrateItemsPriceColumn();
};

const migrateItemsPriceColumn = () => {
  try {
    const tableInfo = db.prepare("PRAGMA table_info(items)").all();
    const hasPriceColumn = tableInfo.some(col => col.name === 'price');
    const hasPurchasePriceColumn = tableInfo.some(col => col.name === 'purchase_price');

    if (hasPriceColumn && !hasPurchasePriceColumn) {
      db.exec(`
        ALTER TABLE items RENAME COLUMN price TO purchase_price;
        ALTER TABLE items ADD COLUMN selling_price REAL NOT NULL DEFAULT 0;
        UPDATE items SET selling_price = purchase_price * 1.25;
      `);
    }
  } catch (error) {
  }
};

module.exports = { migrate };