var express = require('express');
var router = express.Router();
var productController = require('../controllers/productController')

router.post('/store', productController.store)
router.get('/:id', productController.getProduct)
router.put('/:id', productController.update)
router.delete('/:id', productController.delete)

module.exports = router