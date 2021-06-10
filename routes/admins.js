const express = require("express")

const auth = require("../middleware/auth")
const adminController = require("../controllers/admin")

const router = express.Router()

router.post("/login", adminController.login);
router.post("/signup", adminController.signup);
router.post("/vadd", auth, adminController.updateVaccineProfile);

module.exports = router;