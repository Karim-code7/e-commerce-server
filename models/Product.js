const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    image: {
      type: Array, // 🌟 غيرها من String لـ Array
      required: true,
    },
    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    salePrice: Number,
    coastPrice: Number,
    totalStock: Number,
    averageReview: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", ProductSchema);
