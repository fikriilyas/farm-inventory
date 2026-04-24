const categoryService = require('../services/categoryService');

const getAll = (req, res) => {
  const result = categoryService.getAll();

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json(result.data);
};

const create = (req, res) => {
  const { name, description, color } = req.body;
  const result = categoryService.create(name, description, color);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json(result.data);
};

const remove = (req, res) => {
  const { id } = req.params;
  const result = categoryService.remove(id);

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json(result.data);
};

module.exports = { getAll, create, remove };