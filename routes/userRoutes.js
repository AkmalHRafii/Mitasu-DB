const express = require('express')
const UserController = require('../controllers/userController')
const authentication = require('../middlewares/authentication')
const router = express.Router()





router.post("/register", UserController.register)
router.post("/login", UserController.login)
router.patch("/add-username", authentication, UserController.updateUserName)


module.exports = router