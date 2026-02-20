const express = require('express')
const MyworkController = require("../controllers/myworkController");
const authentication = require('../middlewares/authentication')
const router = express.Router()
const upload = require('../middlewares/multer')

router.get("/", authentication, MyworkController.findAll)
router.post("/", authentication, MyworkController.create)
router.get("/:id", authentication, MyworkController.findOne)
router.put("/:id", authentication, MyworkController.update)
router.delete("/:id", authentication, MyworkController.delete)
router.post("/upload/:id", authentication, upload.single("imageUrl"), MyworkController.upload)

module.exports = router
