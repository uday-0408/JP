import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Add debug logs to check environment variables
console.log("Cloudinary Config - Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("Cloudinary Config - API Key exists:", !!process.env.CLOUDINARY_API_KEY);
console.log("Cloudinary Config - API Secret exists:", !!process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify config is applied
console.log("Cloudinary initialized:", !!cloudinary.config);

export default cloudinary;