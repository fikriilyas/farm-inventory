const statsService = require('../services/statsService');

const getStats = (req, res) => {
  const result = statsService.getStats();

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json(result.data);
};

module.exports = { getStats };