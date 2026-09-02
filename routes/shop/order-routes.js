const express = require("express");
const {
  createOrder,
  capturePayment,
  getAllOrderByUser,
  getOrderDeatils,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

router.post("/create", createOrder);
router.post("/capture", capturePayment);
router.get("/getAllOrder/:userId", getAllOrderByUser);
router.get("/getOrderDeatils/:id", getOrderDeatils);

module.exports = router;
