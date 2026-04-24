const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, categoryController.getAll);
router.post('/', requireAuth, categoryController.create);
router.delete('/:id', requireAuth, categoryController.remove);

module.exports = router;