const express = require('express');
const router = express.Router();
const tagsController = require('../controllers/tagsController')
const validate = require("../middleware/auth")


router.get('/', tagsController.findAll)
router.post('/', validate.isAdmin, tagsController.create)
router.get('/:id', tagsController.findOne)
router.put('/:id', validate.isAdmin, tagsController.update)
router.delete('/:id', validate.isAdmin, tagsController.delete)
module.exports = router