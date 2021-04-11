const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController')

// router.get('/', orderController.index)
router.get('/', orderController.findAll)
router.post('/', orderController.create)
router.get('/:id', orderController.findOne)
router.put('/:id', orderController.update)

module.exports = router