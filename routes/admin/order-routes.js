const express = require("express");

const router = express.Router();
const {
  getAllOrders,
  getOrderDeatilsForAdmin,
  updateOrderStatus,
} = require("../../controllers/admin/order-controller");
router.get("/getAllOrders", getAllOrders);
router.get(
  "/getOrderDeatilsForAdmin/:id",

  getOrderDeatilsForAdmin,
);
router.put("/updateOrderStatus", updateOrderStatus);
module.exports = router;
