const db = require('../config/database');

const getSales = (date) => {
  try {
    const sales = db.prepare(`
      SELECT s.id, s.total_amount, s.total_profit, s.created_at,
             (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as item_count
      FROM sales s
      WHERE DATE(s.created_at) = ?
      ORDER BY s.created_at DESC
    `).all(date);

    const summary = db.prepare(`
      SELECT COUNT(*) as transaction_count,
             COALESCE(SUM(total_amount), 0) as total_omset,
             COALESCE(SUM(total_profit), 0) as total_profit
      FROM sales
      WHERE DATE(created_at) = ?
    `).get(date);

    return { success: true, data: { sales, summary } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getSaleDetail = (id) => {
  try {
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
    if (!sale) return { success: false, error: 'Sale not found' };

    const items = db.prepare(`
      SELECT si.*, i.name as item_name, i.unit as item_unit
      FROM sale_items si
      LEFT JOIN items i ON si.item_id = i.id
      WHERE si.sale_id = ?
    `).all(id);

    return { success: true, data: { ...sale, items } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createSale = (saleItems) => {
  try {
    const runSale = db.transaction(() => {
      let totalAmount = 0;
      let totalProfit = 0;
      const saleDetails = [];

      for (const entry of saleItems) {
        const item = db.prepare('SELECT * FROM items WHERE id = ?').get(entry.item_id);
        if (!item) throw new Error(`Item ${entry.item_id} not found`);
        if (item.quantity < entry.quantity) {
          throw new Error(`Stok ${item.name} tidak cukup (tersedia: ${item.quantity})`);
        }

        const quantity = entry.quantity;
        const unitPrice = entry.unit_price || item.selling_price;
        const subtotal = quantity * unitPrice;
        const profit = (unitPrice - item.purchase_price) * quantity;

        db.prepare('UPDATE items SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(quantity, entry.item_id);

        totalAmount += subtotal;
        totalProfit += profit;
        saleDetails.push({ item_id: item.id, name: item.name, quantity, unit_price: unitPrice, subtotal });
      }

      const result = db.prepare('INSERT INTO sales (total_amount, total_profit) VALUES (?, ?)').run(totalAmount, totalProfit);
      const saleId = result.lastInsertRowid;

      for (const entry of saleItems) {
        const item = db.prepare('SELECT * FROM items WHERE id = ?').get(entry.item_id);
        db.prepare(`
          INSERT INTO sale_items (sale_id, item_id, quantity, unit_price, purchase_price, subtotal)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(saleId, entry.item_id, entry.quantity, entry.unit_price || item.selling_price, item.purchase_price, entry.quantity * (entry.unit_price || item.selling_price));
      }

      return { sale_id: saleId, total_amount: totalAmount, total_profit: totalProfit, items: saleDetails };
    });

    const result = runSale();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { getSales, getSaleDetail, createSale };
