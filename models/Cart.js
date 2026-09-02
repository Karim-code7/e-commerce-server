const mongose = require("mongoose");
const Product = require("../models/Product"); // تأكد من المسار الصحيح
const CartSchema = new mongose.Schema(
  {
    userId: {
      type: mongose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongose.model("Cart", CartSchema);
