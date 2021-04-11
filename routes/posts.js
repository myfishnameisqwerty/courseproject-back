const express = require('express');
const router = express.Router();
const postsController = require("../controllers/postsController")


router.get("/", postsController.index)
router.post("/", postsController.create)
router.put("/:id", postsController.update)
router.get("/:id", postsController.findOne)
router.delete(":id", postsController.delete)

module.exports = router;
