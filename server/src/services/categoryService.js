const db = require('../config/database');

const getAll = () => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    return { success: true, data: categories };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const create = (name, description, color) => {
  try {
    const stmt = db.prepare('INSERT INTO categories (name, description, color) VALUES (?, ?, ?)');
    const result = stmt.run(name, description, color);
    return {
      success: true,
      data: { id: result.lastInsertRowid, name, description, color }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const remove = (id) => {
  try {
    db.prepare('UPDATE items SET category_id = NULL WHERE category_id = ?').run(id);
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return { success: true, data: { success: true } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { getAll, create, remove };