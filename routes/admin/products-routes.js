const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  addProduct,
  fetchAllProduct,
  deleteProduct,
  editProduct,
  handleMultipleImagesUpload,
  getProductDetailsForAdmin, // 🌟 كدا هتيجي قيمتها صح ومش هتبقى undefined
} = require("../../controllers/admin/products-controller");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Megabytes max
});

// الـ Route بقا نضيف وبيستدعي الدالة المستوردة فوق
router.post(
  "/upload-image",
  upload.array("my_file", 5),
  handleMultipleImagesUpload,
);

router.post("/add", addProduct);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get", fetchAllProduct);
router.get("/get-productDetails/:id", getProductDetailsForAdmin);

module.exports = router;
