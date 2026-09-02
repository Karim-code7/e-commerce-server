const Order = require("../../models/Order");
const Product = require("../../models/Product");
const ProductReview = require("../../models/Review");

const addProductReview = async (req, res) => {
  try {
    const { userId, productId, userName, reviewMessage, reviewValue } =
      req.body;

    const order = await Order.findOne({
      userId,
      "cartItems.productId": productId,
      orderStatus: "delivered",
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message:
          "You can only review if you order this product and it is delivered",
      });
    }
    const checkExistingReview = await ProductReview.findOne({
      userId,
      productId,
    });
    if (checkExistingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const newReview = new ProductReview({
      userId,
      productId,
      userName,
      reviewMessage,
      reviewValue,
    });

    await newReview.save();

    const reviews = await ProductReview.find({ productId });

    const totalReview = reviews.length;
    const averageReview =
      totalReview > 0
        ? Math.round(
            reviews.reduce((acc, review) => acc + review.reviewValue, 0) /
              totalReview,
          )
        : 0;

    await Product.findByIdAndUpdate(productId, {
      averageReview,
    });
    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: newReview,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Some error occored",
    });
  }
};
const getProductReview = async (req, res) => {
  const { productId } = req.params;

  const reviews = await ProductReview.find({ productId });
  try {
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Some error occored",
    });
  }
};

module.exports = {
  addProductReview,
  getProductReview,
};
