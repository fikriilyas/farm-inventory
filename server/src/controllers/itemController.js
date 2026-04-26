const itemService = require('../services/itemService');

const getAll = (req, res) => {
  const { search, category, stock } = req.query;
  const filters = { search, category, stock };
  const result = itemService.getAll(filters);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json(result.data);
};

const getById = (req, res) => {
  const { id } = req.params;
  const result = itemService.getById(id);

  if (!result.success) {
    return res.status(404).json({ error: result.error });
  }

  res.json(result.data);
};

const create = (req, res) => {
  const result = itemService.create(req.body);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json(result.data);
};

const update = (req, res) => {
  const { id } = req.params;
  const result = itemService.update(id, req.body);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json(result.data);
};

const remove = (req, res) => {
  const { id } = req.params;
  const result = itemService.remove(id);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json(result.data);
};

const batchAdd = (req, res) => {
  const result = itemService.batchAdd(req.body);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json(result.data);
};

module.exports = { getAll, getById, create, update, remove, batchAdd };