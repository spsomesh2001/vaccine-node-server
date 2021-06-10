const express = require("express")

const auth = require("../middleware/auth")
const profileController = require("../controllers/profile")

const router = express.Router()

router.get("/", auth, profileController.getProfile);
router.post("/formFill", auth, profileController.formFill);
router.post("/locInfo", auth, profileController.locInfo);

module.exports = router;
