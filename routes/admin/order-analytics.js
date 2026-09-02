const express = require("express");
const {
  getAdminAnalytics,
  getOrderStatusStats,
} = require("../../controllers/admin/order-controller");

const router = express.Router();
router.get("/", getAdminAnalytics);
router.get("/status", getOrderStatusStats);
module.exports = router;
