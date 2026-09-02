const Products = require("../../models/Product");
const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.params;
    if (!keyword || typeof keyword !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid keyword" });
    }
    const regEx = new RegExp(keyword, "i");

    const createSearchQuery = {
      $or: [
        { title: regEx },
        { description: regEx },
        { category: regEx },
        { brand: regEx },
      ],
    };

    const searchResult = await Products.find(createSearchQuery).select("-__v");

    res.status(200).json({
      success: true,
      data: searchResult,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  searchProducts,
};
