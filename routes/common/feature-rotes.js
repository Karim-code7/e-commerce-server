const express = require("express");
const {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImages,
} = require("../../controllers/admin/common/feateure-controller");
const multer = require("multer");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-image", upload.array("my_file", 2), addFeatureImage);
router.get("/all-images", getFeatureImages);
router.delete("/:id", deleteFeatureImages);
module.exports = router;
