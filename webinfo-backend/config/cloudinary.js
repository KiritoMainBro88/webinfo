const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary using environment variables
// Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET are set in Render
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Use https links
});

console.log('Cloudinary Configured with Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'NOT SET');

// Configure Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    // folder: 'kmb_uploads', // Optional: specify a folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    // transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional: transform uploads
    // public_id: (req, file) => 'computed-filename-using-request', // Optional: custom public ID
  },
});

// Create Multer instance with the Cloudinary storage
const upload = multer({ storage: storage });

module.exports = upload; // Export the configured multer instance 