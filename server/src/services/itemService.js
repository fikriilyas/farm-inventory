const db = require('../config/database');

const getAll = (filters = {}) => {
  try {
    const { search, category, stock } = filters;
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
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getById = (id) => {
  try {
    const item = db.prepare(`
      SELECT i.*, c.name as category_name, c.color as category_color
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?
    `).get(id);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const create = (data) => {
  try {
    const {
      name, quantity, purchase_price, selling_price, unit, category_id,
      low_stock_threshold, description
    } = data;
    const stmt = db.prepare(`
      INSERT INTO items (name, quantity, purchase_price, selling_price, unit, category_id, low_stock_threshold, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      name, quantity, purchase_price, selling_price, unit, category_id,
      low_stock_threshold, description
    );
    return {
      success: true,
      data: {
        id: result.lastInsertRowid, name, quantity, purchase_price,
        selling_price, unit, category_id, low_stock_threshold, description
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const update = (id, data) => {
  try {
    const {
      name, quantity, purchase_price, selling_price, unit, category_id,
      low_stock_threshold, description
    } = data;
    const stmt = db.prepare(`
      UPDATE items
      SET name = ?, quantity = ?, purchase_price = ?, selling_price = ?, unit = ?, category_id = ?,
          low_stock_threshold = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      name, quantity, purchase_price, selling_price, unit, category_id,
      low_stock_threshold, description, id
    );
    return {
      success: true,
      data: {
        id, name, quantity, purchase_price, selling_price, unit,
        category_id, low_stock_threshold, description
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const remove = (id) => {
  try {
    db.prepare('DELETE FROM items WHERE id = ?').run(id);
    return { success: true, data: { success: true } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const batchAdd = (batchData) => {
  try {
    const { items } = batchData;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'Items array is required' };
    }

    let processed = 0;
    let updated = 0;
    let created = 0;
    let totalValue = 0;
    const details = [];

    const runBatch = db.transaction(() => {
      for (const item of items) {
        if (item.mode === 'existing') {
          // Get existing item
          const existingItem = db.prepare(`
            SELECT * FROM items WHERE id = ?
          `).get(item.itemId);

          if (!existingItem) {
            throw new Error(`Item with id ${item.itemId} not found`);
          }

          // Calculate new quantity
          const newQuantity = existingItem.quantity + item.quantity;

          // Calculate price for total value
          let priceToUse = existingItem.purchase_price;
          if (item.updatePrice && item.newPrice !== null) {
            priceToUse = item.newPrice;
          }

          // Update item
          if (item.updatePrice && item.newPrice !== null) {
            db.prepare(`
              UPDATE items
              SET quantity = ?, purchase_price = ?, selling_price = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(newQuantity, item.newPrice, item.newPrice * 1.2, item.itemId);
          } else {
            db.prepare(`
              UPDATE items
              SET quantity = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(newQuantity, item.itemId);
          }

          totalValue += item.quantity * priceToUse;
          updated++;
          details.push({
            itemId: item.itemId,
            action: 'updated',
            newQuantity
          });
        } else if (item.mode === 'new') {
          // Create new item
          const stmt = db.prepare(`
            INSERT INTO items (name, quantity, purchase_price, selling_price, unit, category_id, low_stock_threshold, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          const purchasePrice = item.price;
          const sellingPrice = item.price * 1.2;

          const result = stmt.run(
            item.name,
            item.quantity,
            purchasePrice,
            sellingPrice,
            item.unit || 'pcs',
            item.categoryId,
            10,
            item.description || ''
          );

          totalValue += item.quantity * purchasePrice;
          created++;
          details.push({
            itemId: result.lastInsertRowid,
            action: 'created',
            newItemId: result.lastInsertRowid
          });
        }
        processed++;
      }
    });

    runBatch();

    return {
      success: true,
      data: {
        success: true,
        processed,
        updated,
        created,
        totalValue,
        details
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { getAll, getById, create, update, remove, batchAdd };