// backend/controllers/uploadController.js

const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded.',
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'house-of-jaee/products',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    res.json({
      success: true,
      images: uploadedImages,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Image upload failed.',
    });
  }
};