const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")

router.post("/login", userController.Login)
router.post("/check", userController.userExists)
router.get("/", userController.findAll)
router.post("/", userController.create)
router.put("/:id", userController.update)
router.get("/:id", userController.findOne)
router.delete(":id", userController.delete)

module.exports = router;
