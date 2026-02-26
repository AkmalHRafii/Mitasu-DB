const express = require('express')
const BookmarkController = require('../controllers/bookmarkController')
const authentication = require('../middlewares/authentication')
const router = express.Router()


router.use(authentication)
router.get("/", BookmarkController.read)
router.post("/", BookmarkController.add)
router.delete("/:id", BookmarkController.delete)


module.exports = router