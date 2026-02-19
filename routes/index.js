const express = require('express')
const errorHandler = require('../middlewares/errorHandler')
const router = express.Router()
const userRoutes = require("./userRoutes")
const bookmarkRoutes = require("./bookmarkRoutes")
const geminiRoutes = require("./geminiRoutes")


router.get('/', (req, res) => {
  res.send('Hello World!')
})

router.use("/user", userRoutes)
router.use("/bookmark", bookmarkRoutes)
router.use("/ai", geminiRoutes)

router.use(errorHandler)

module.exports = router