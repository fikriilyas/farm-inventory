const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
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

// Database setup
const dbPath = path.join(__dirname, 'db', 'inventory.db');
const db = new Database(dbPath);

// Initialize database tables
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

// Migration: Check if old 'price' column exists and migrate to purchase_price/selling_price
try {
  const tableInfo = db.prepare("PRAGMA table_info(items)").all();
  const hasPriceColumn = tableInfo.some(col => col.name === 'price');
  const hasPurchasePriceColumn = tableInfo.some(col => col.name === 'purchase_price');
  
  if (hasPriceColumn && !hasPurchasePriceColumn) {
    // Migrate old price column to purchase_price and selling_price
    db.exec(`
      ALTER TABLE items RENAME COLUMN price TO purchase_price;
      ALTER TABLE items ADD COLUMN selling_price REAL NOT NULL DEFAULT 0;
      UPDATE items SET selling_price = purchase_price * 1.25;
    `);
    console.log('Database migration completed: price -> purchase_price, added selling_price');
  }
} catch (error) {
  console.log('Migration check skipped:', error.message);
}

// Seed data if empty
const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (categoryCount.count === 0) {
  // Seed categories
  const insertCategory = db.prepare('INSERT INTO categories (name, description, color) VALUES (?, ?, ?)');
  const categories = [
    ['Seeds', 'Various seeds for planting', '#22c55e'],
    ['Fertilizers', 'Soil enrichment products', '#84cc16'],
    ['Pesticides', 'Pest control products', '#ef4444'],
    ['Tools', 'Farming tools and equipment', '#f59e0b'],
    ['Produce', 'Fresh farm produce', '#10b981'],
    ['Hardware', 'Hardware supplies', '#6366f1'],
    ['Livestock', 'Animal supplies', '#8b5cf6']
  ];
  categories.forEach(c => insertCategory.run(c[0], c[1], c[2]));

  // Seed items
  const insertItem = db.prepare(`
    INSERT INTO items (name, quantity, purchase_price, selling_price, unit, category_id, low_stock_threshold, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const items = [
    // Seeds (purchase_price, selling_price)
    ['Tomato Seeds', 150, 20.00, 25.00, 'pack', 1, 20, 'High-yield tomato seeds'],
    ['Lettuce Seeds', 200, 15.00, 20.00, 'pack', 1, 30, 'Fresh green lettuce seeds'],
    ['Corn Seeds', 100, 25.00, 30.00, 'pack', 1, 15, 'Sweet corn hybrid seeds'],
    ['Carrot Seeds', 180, 14.00, 18.00, 'pack', 1, 25, 'Orange carrot seeds'],
    ['Cucumber Seeds', 120, 18.00, 22.00, 'pack', 1, 20, 'Cucumber seeds'],
    ['Bell Pepper Seeds', 80, 23.00, 28.00, 'pack', 1, 15, 'Mixed color pepper seeds'],

    // Fertilizers
    ['Organic Compost', 50, 35.00, 45.00, 'bag', 2, 10, 'Natural compost fertilizer'],
    ['NPK 10-10-10', 75, 45.00, 55.00, 'bag', 2, 15, 'Balanced fertilizer'],
    ['Urea', 60, 32.00, 40.00, 'bag', 2, 12, 'Nitrogen fertilizer'],
    ['Cow Manure', 40, 28.00, 35.00, 'bag', 2, 8, 'Dried cow manure'],
    ['Bone Meal', 30, 40.00, 50.00, 'kg', 2, 5, 'Phosphorus supplement'],

    // Pesticides
    ['Insecticide Spray', 25, 50.00, 65.00, 'bottle', 3, 8, 'General insect killer'],
    ['Fungicide', 20, 60.00, 75.00, 'bottle', 3, 5, 'Plant fungus treatment'],
    ['Weed Killer', 35, 45.00, 55.00, 'bottle', 3, 10, 'Herbicide concentrate'],
    ['Rat Poison', 40, 25.00, 30.00, 'pack', 3, 10, 'Rodent control'],
    ['Organic Pesticide', 15, 65.00, 80.00, 'bottle', 3, 5, 'Natural pest control'],

    // Tools
    ['Shovel', 20, 65.00, 85.00, 'pcs', 4, 5, 'Heavy duty shovel'],
    ['Rake', 25, 50.00, 65.00, 'pcs', 4, 5, 'Garden rake'],
    ['Hoe', 18, 58.00, 75.00, 'pcs', 4, 5, 'Cultivation hoe'],
    ['Watering Can', 30, 35.00, 45.00, 'pcs', 4, 8, '10L watering can'],
    ['Pruning Shears', 40, 42.00, 55.00, 'pcs', 4, 10, 'Sharp pruning scissors'],
    ['Wheelbarrow', 8, 280.00, 350.00, 'pcs', 4, 2, 'Garden wheelbarrow'],
    ['Garden Hose', 15, 95.00, 120.00, 'pcs', 4, 3, '30m garden hose'],

    // Produce
    ['Fresh Tomatoes', 100, 10.00, 15.00, 'kg', 5, 20, 'Farm fresh tomatoes'],
    ['Fresh Corn', 80, 8.00, 12.00, 'pcs', 5, 15, 'Sweet corn cobs'],
    ['Lettuce Bunch', 60, 5.00, 8.00, 'bunch', 5, 15, 'Green lettuce'],
    ['Carrots', 70, 7.00, 10.00, 'kg', 5, 15, 'Fresh carrots'],
    ['Cucumbers', 50, 8.00, 12.00, 'kg', 5, 10, 'Cucumber harvest'],

    // Hardware
    ['Fencing Wire', 10, 200.00, 250.00, 'roll', 6, 3, 'Galvanized wire'],
    ['Nails', 50, 10.00, 15.00, 'kg', 6, 10, 'Assorted nails'],
    ['PVC Pipe', 20, 65.00, 85.00, 'pcs', 6, 5, '3m PVC pipe'],
    ['Garden Hose', 12, 120.00, 150.00, 'pcs', 6, 3, '50m hose'],

    // Livestock
    ['Chicken Feed', 30, 95.00, 120.00, 'bag', 7, 8, 'Poultry feed'],
    ['Cattle Feed', 15, 200.00, 250.00, 'bag', 7, 5, 'Cattle supplement'],
    ['Vitamin Supplements', 25, 65.00, 85.00, 'bottle', 7, 8, 'Animal vitamins']
  ];
  items.forEach(i => insertItem.run(i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7]));
}

// Seed users if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
  
  // Hash passwords
  const ownerHash = bcrypt.hashSync('owner123', 10);
  const officerHash = bcrypt.hashSync('officer123', 10);
  
  insertUser.run('owner', ownerHash, 'owner');
  insertUser.run('officer1', officerHash, 'officer');
  insertUser.run('officer2', officerHash, 'officer');
  insertUser.run('officer3', officerHash, 'officer');
  
  console.log('Users seeded: owner, officer1, officer2, officer3');
}

// ============ AUTHENTICATION ============

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
};

// Login route
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Set session
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    
    res.json({ 
      user: req.session.user,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// ============ PROTECTED ROUTES ============

// Get all categories
app.get('/api/categories', requireAuth, (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create category
app.post('/api/categories', requireAuth, (req, res) => {
  try {
    const { name, description, color } = req.body;
    const stmt = db.prepare('INSERT INTO categories (name, description, color) VALUES (?, ?, ?)');
    const result = stmt.run(name, description, color);
    res.json({ id: result.lastInsertRowid, name, description, color });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete category
app.delete('/api/categories/:id', requireAuth, (req, res) => {
  try {
    const id = req.params.id;
    
    // Set category_id to NULL for items in this category
    db.prepare('UPDATE items SET category_id = NULL WHERE category_id = ?').run(id);
    
    // Delete the category
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all items with optional filters
app.get('/api/items', requireAuth, (req, res) => {
  try {
    const { search, category, stock } = req.query;
    let query = `
      SELECT i.*, c.name as category_name, c.color as category_color
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND i.name LIKE ?';
      params.push(`%${search}%`);
    }
    if (category) {
      query += ' AND i.category_id = ?';
      params.push(category);
    }
    if (stock === 'low') {
      query += ' AND i.quantity <= i.low_stock_threshold AND i.quantity > 0';
    } else if (stock === 'out') {
      query += ' AND i.quantity = 0';
    } else if (stock === 'in') {
      query += ' AND i.quantity > i.low_stock_threshold';
    }

    query += ' ORDER BY i.name';
    const items = db.prepare(query).all(...params);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single item
app.get('/api/items/:id', requireAuth, (req, res) => {
  try {
    const item = db.prepare(`
      SELECT i.*, c.name as category_name, c.color as category_color
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?
    `).get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create item
app.post('/api/items', requireAuth, (req, res) => {
  try {
    const { name, quantity, purchase_price, selling_price, unit, category_id, low_stock_threshold, description } = req.body;
    const stmt = db.prepare(`
      INSERT INTO items (name, quantity, purchase_price, selling_price, unit, category_id, low_stock_threshold, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, quantity, purchase_price, selling_price, unit, category_id, low_stock_threshold, description);
    res.json({ id: result.lastInsertRowid, name, quantity, purchase_price, selling_price, unit, category_id, low_stock_threshold, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update item
app.put('/api/items/:id', requireAuth, (req, res) => {
  try {
    const { name, quantity, purchase_price, selling_price, unit, category_id, low_stock_threshold, description } = req.body;
    const stmt = db.prepare(`
      UPDATE items
      SET name = ?, quantity = ?, purchase_price = ?, selling_price = ?, unit = ?, category_id = ?,
          low_stock_threshold = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(name, quantity, purchase_price, selling_price, unit, category_id, low_stock_threshold, description, req.params.id);
    res.json({ id: req.params.id, name, quantity, purchase_price, selling_price, unit, category_id, low_stock_threshold, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete item
app.delete('/api/items/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats
app.get('/api/stats', requireAuth, (req, res) => {
  try {
    const totalItems = db.prepare('SELECT COUNT(*) as count FROM items').get();
    const totalValue = db.prepare('SELECT SUM(quantity * selling_price) as value FROM items').get();
    const lowStock = db.prepare('SELECT COUNT(*) as count FROM items WHERE quantity <= low_stock_threshold AND quantity > 0').get();
    const outOfStock = db.prepare('SELECT COUNT(*) as count FROM items WHERE quantity = 0').get();
    const categories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
    const categoryBreakdown = db.prepare(`
      SELECT c.name, c.color, COUNT(i.id) as item_count, SUM(i.quantity) as total_quantity
      FROM categories c
      LEFT JOIN items i ON c.id = i.category_id
      GROUP BY c.id
      ORDER BY item_count DESC
    `).all();

    res.json({
      totalItems: totalItems.count,
      totalValue: totalValue.value || 0,
      lowStock: lowStock.count,
      outOfStock: outOfStock.count,
      categories: categories.count,
      categoryBreakdown
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server (skip if in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
