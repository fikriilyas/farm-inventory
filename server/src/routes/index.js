const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const itemRoutes = require('./itemRoutes');
const salesRoutes = require('./salesRoutes');
const statsRoutes = require('./statsRoutes');

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/items', itemRoutes);
router.use('/sales', salesRoutes);
router.use('/stats', statsRoutes);

module.exports = router;