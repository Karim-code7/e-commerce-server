const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");
cloudinary.config({
  cloud_name: process.env.CLOUDEINARY_CLOUD_NAME,
  api_key: process.env.CLOUDEINARY_API_KEY,
  api_secret: process.env.CLOUDEINARY_SECRET_KEY,
});

const handleMultipleImagesUploadUtil = async (
  files,
  folderName = "general",
) => {
  const uploadPromises = files.map(async (file) => {
    // 1. معالجة الصورة بـ Sharp في الذاكرة
    const optimizedBuffer = await sharp(file.buffer)
      .webp({ quality: 80, lossless: false })
      .resize({ width: 1920, withoutEnlargement: true })
      .toBuffer();

    // 2. رفع الـ Buffer إلى كلووديناري
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          format: "webp",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );

      stream.end(optimizedBuffer);
    });
  });

  return Promise.all(uploadPromises);
};
module.exports = { handleMultipleImagesUploadUtil };
