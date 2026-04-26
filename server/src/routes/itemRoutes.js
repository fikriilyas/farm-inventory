const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, itemController.getAll);
router.get('/:id', requireAuth, itemController.getById);
router.post('/', requireAuth, itemController.create);
router.post('/batch', requireAuth, itemController.batchAdd);
router.put('/:id', requireAuth, itemController.update);
router.delete('/:id', requireAuth, itemController.remove);

module.exports = router;