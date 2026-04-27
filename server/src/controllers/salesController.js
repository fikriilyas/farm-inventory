const salesService = require('../services/salesService');

const getSales = (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const result = salesService.getSales(date);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json(result.data);
};

const getSaleDetail = (req, res) => {
  const { id } = req.params;
  const result = salesService.getSaleDetail(id);

  if (!result.success) {
    return res.status(404).json({ error: result.error });
  }

  res.json(result.data);
};

const createSale = (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  const result = salesService.createSale(items);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ ...result.data, success: true });
};

module.exports = { getSales, getSaleDetail, createSale };
