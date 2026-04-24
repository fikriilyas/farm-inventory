const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const itemRoutes = require('./itemRoutes');
const statsRoutes = require('./statsRoutes');

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/items', itemRoutes);
router.use('/stats', statsRoutes);

module.exports = router;