const bcrypt = require('bcryptjs');
const db = require('../config/database');

const login = (username, password) => {
  if (!username || !password) {
    return { success: false, error: 'Username and password required' };
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return { success: false, error: 'Invalid username or password' };
  }

  const sessionUser = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  return { success: true, data: { user: sessionUser, message: 'Login successful' } };
};

const logout = () => {
  return { success: true, data: { message: 'Logged out successfully' } };
};

const getCurrentUser = (session) => {
  if (session && session.user) {
    return { success: true, data: { user: session.user } };
  }
  return { success: false, error: 'Not authenticated' };
};

module.exports = { login, logout, getCurrentUser };