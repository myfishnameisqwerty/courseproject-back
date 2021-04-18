const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController')
const validate = require("../middleware/auth")

router.get('/', productController.findAll)
router.get('/image/:imageName', productController.getImage)
router.get('/:id', productController.getProduct)
router.post('/', validate.privilegeUser, productController.create)
router.put('/:id', validate.privilegeUser, productController.update)
router.delete('/:id',validate.privilegeUser, productController.delete)

module.exports = router