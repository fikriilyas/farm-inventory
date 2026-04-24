const authService = require('../services/authService');

const login = (req, res) => {
  const { username, password } = req.body;
  const result = authService.login(username, password);

  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  req.session.user = result.data.user;
  res.json(result.data);
};

const logout = (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
};

const me = (req, res) => {
  const result = authService.getCurrentUser(req.session);

  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  res.json(result.data);
};

module.exports = { login, logout, me };