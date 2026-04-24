const db = require('../config/database');

const getStats = () => {
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

    return {
      success: true,
      data: {
        totalItems: totalItems.count,
        totalValue: totalValue.value || 0,
        lowStock: lowStock.count,
        outOfStock: outOfStock.count,
        categories: categories.count,
        categoryBreakdown
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { getStats };