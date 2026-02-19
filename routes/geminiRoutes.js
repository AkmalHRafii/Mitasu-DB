const express = require('express')
const authentication = require('../middlewares/authentication')
const router = express.Router()
const geminiController = require('../controllers/geminiController')

router.get("/recommend", authentication, geminiController.recommend)

module.exports = router
