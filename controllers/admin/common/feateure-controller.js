const {
  handleMultipleImagesUploadUtil,
} = require("../../../helpres/cloudinary");
const Feature = require("../../../models/Feature");

//

const addFeatureImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images uploaded" });
    }

    const imageUrls = await handleMultipleImagesUploadUtil(req.files);

    const featureImages = new Feature({
      imageUrls,
    });

    await featureImages.save();
    res.status(200).json({
      success: true,
      data: featureImages,
      message: "Images uploaded successfully!",
    });
  } catch (error) {
    console.error("Error in addFeatureImage controller:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({});
    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const deleteFeatureImages = async (req, res) => {
  try {
    const { id } = req.params;
    const images = await Feature.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Features image deleted successfully!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImages,
};
