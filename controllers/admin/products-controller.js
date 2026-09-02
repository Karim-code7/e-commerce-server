const Product = require("../../models/Product");
const cloudinary = require("cloudinary").v2;
const { handleMultipleImagesUploadUtil } = require("../../helpres/cloudinary");
// استيراد الدالة المساعدة من مسارها الصحيح

const handleMultipleImagesUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    // استدعاء الدالة وتمرير الملفات والمجلد المطلوب 🌟
    const imageUrls = await handleMultipleImagesUploadUtil(
      req.files,
      "ecommerce",
    );

    res.json({
      success: true,
      result: imageUrls,
    });
    return res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      data: imageUrls,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error occurred during multiple images upload",
    });
  }
};

// ADD A NEW PRODUCT
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      coastPrice,
    } = req.body;

    const newlyCreateProducts = new Product({
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      coastPrice,
    });

    await newlyCreateProducts.save();

    res.status(201).json({
      success: true,
      data: newlyCreateProducts,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Something is wrong ",
    });
  }
};
//FETCH ALL PRODUCTS
const fetchAllProduct = async (req, res) => {
  try {
    const listofProducts = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: listofProducts,
    });
  } catch (err) {
    console.log(err);
    res.satus(500).json({
      success: false,
      message: "Something is wrong ",
    });
  }
};
//EDIT A PRODUCT
let editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
    } = req.body;
    const findProduct = await Product.findById(id);
    if (!findProduct)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    findProduct.image = image || findProduct.image;
    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    findProduct.price = price === `` ? 0 : price || findProduct.price;
    findProduct.salePrice =
      salePrice === `` ? 0 : salePrice || findProduct.salePrice;
    findProduct.totalStock = totalStock || findProduct.totalStock;
    await findProduct.save();
    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (err) {
    console.log(err);
    res.satus(500).json({
      success: false,
      message: "Something is wrong ",
    });
  }
};
// DELETE A PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    if (product.image && product.image.length > 0) {
      const deletePromises = product.image.map((imageUrl) => {
        const urlParts = imageUrl.split("/upload/");
        const pathAfterUpload = urlParts[1].split("/");

        const folderName = pathAfterUpload[1];

        const publicId = pathAfterUpload[2].split(".")[0];

        return cloudinary.uploader.destroy(`${folderName}/${publicId}`);
      });
      await Promise.all(deletePromises);
    }
    res.status(200).json({
      success: true,
      message: "Product delete successfully",
    });
  } catch (err) {
    console.log(err);
    res.satus(500).json({
      success: false,
      message: "Something is wrong ",
    });
  }
};
const getProductDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const productDeatils = await Product.findById(id);
    if (!productDeatils) {
      return res.satus(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Product details fetched successfully!",
      data: productDeatils,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      success: false,
      message: "Something is wrong ",
    });
  }
};
module.exports = {
  handleMultipleImagesUpload,
  addProduct,
  fetchAllProduct,
  editProduct,
  deleteProduct,
  getProductDetailsForAdmin,
};
