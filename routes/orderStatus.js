const express = require('express');
const router = express.Router();
const orderStatusController = require('../controllers/orderStatusController')

router.get('/', orderStatusController.findAll)
router.post('/', orderStatusController.create)
router.get('/:id', orderStatusController.findOne)
router.put('/:id', orderStatusController.update)
router.delete('/:id', orderStatusController.delete)

module.exports = router