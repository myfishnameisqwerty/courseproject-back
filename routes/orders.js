const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController')
const validate = require("../middleware/auth")

// router.get('/', orderController.index)
router.get('/', validate.privilegeUser, orderController.findAll)
router.post('/', orderController.create)
router.get('/:id', orderController.findOne)
router.put('/:id', validate.privilegeUser, orderController.update)

module.exports = router