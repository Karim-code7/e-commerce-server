const express = require("express");

const fetchUser = require("../../controllers/admin/user-controller");

const router = express.Router();

router.get("/fetchUser/:userId", fetchUser);
module.exports = router;
