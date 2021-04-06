const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController')

router.get('/', productController.index)
router.post('/', productController.create)
router.get('/:id', productController.getProduct)
router.put('/:id', productController.update)
router.delete('/:id', productController.delete)
module.exports = router