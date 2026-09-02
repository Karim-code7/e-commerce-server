const mongoo = require("mongoose");

const ProductReveiwSchema = new mongoo.Schema(
  {
    userId: String,
    productId: String,
    userName: String,
    reviewMessage: String,
    reviewValue: Number,
  },
  { timestamps: true },
);

module.exports = mongoo.model("ProductReview", ProductReveiwSchema);
