const express = require("express");
const {
  getFilterdProducts,
  getProductDetails,
} = require("../../controllers/shop/products-controller");

const router = express.Router();
router.get("/all-products", getFilterdProducts);
router.get("/details/:id", getProductDetails);
module.exports = router;
