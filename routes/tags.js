const express = require('express');
const router = express.Router();
const tagsController = require('../controllers/tagsController')

router.get('/', tagsController.findAll)
router.post('/', tagsController.create)
router.get('/:id', tagsController.findOne)
router.put('/:id', tagsController.update)
router.delete('/:id', tagsController.delete)
module.exports = router