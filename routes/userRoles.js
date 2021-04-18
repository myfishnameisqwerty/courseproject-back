const express = require('express')
const router = express.Router()
const rolesController = require('../controllers/userRolesController')
const validate = require("../middleware/auth")

router.get('/', rolesController.findAll)
router.get('/:id', rolesController.findOne)
router.post('/', validate.isAdmin, rolesController.create)
router.put('/:id', validate.isAdmin, rolesController.update)
router.delete('/:id', validate.isAdmin, rolesController.delete)
module.exports = router