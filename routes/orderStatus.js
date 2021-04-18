const express = require('express');
const router = express.Router();
const orderStatusController = require('../controllers/orderStatusController')
const validate = require("../middleware/auth")


router.get('/', orderStatusController.findAll)
router.get('/:id', orderStatusController.findOne)
router.post('/', validate.isAdmin, orderStatusController.create)
router.put('/:id', validate.isAdmin, orderStatusController.update)
router.delete('/:id', validate.isAdmin, orderStatusController.delete)

module.exports = router