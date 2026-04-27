const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, salesController.getSales);
router.get('/:id', requireAuth, salesController.getSaleDetail);
router.post('/', requireAuth, salesController.createSale);

module.exports = router;
