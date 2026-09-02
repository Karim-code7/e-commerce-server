const express = require("express");
const {
  addToCart,
  fetchCartItems,
  ubdateCartItemQty,
  deleteCartItem,
} = require("../../controllers/shop/cart-conroller");

const router = express.Router();

router.post("/add", addToCart);
router.get("/get/:userId", fetchCartItems);
router.put("/ubdate-cart", ubdateCartItemQty);
router.delete("/delete-item/:userId/:productId", deleteCartItem);

module.exports = router;
