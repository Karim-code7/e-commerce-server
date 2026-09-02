const mongoose = require("mongoose");

const FeateureSchema = new mongoose.Schema(
  {
    imageUrls: [{ type: String, required: true }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Feature", FeateureSchema);
