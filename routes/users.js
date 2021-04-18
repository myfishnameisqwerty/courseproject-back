const express = require('express');
const router = express.Router();
const userController = require("../controllers/userController")
const validate = require("../middleware/auth")

router.post("/login", userController.Login)
router.post("/check", userController.userExists)
router.post("/", userController.create)
router.get("/", validate.isAuthorised, userController.findAll)
router.get("/token", validate.isAuthorised, userController.findByToken)
router.put("/:id", validate.isAuthorised, userController.update)
router.get("/:id", validate.isAuthorised, userController.findOne)
router.delete(":id", validate.isAdmin, userController.delete)

module.exports = router;
