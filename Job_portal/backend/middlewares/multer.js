import multer, { MulterError } from "multer";

const storage = multer.memoryStorage();
export const singleUpload = multer({storage}).single("file");

// For handling multiple files with specific field names
export const multiUpload = multer({storage}).fields([
  { name: 'file', maxCount: 1 },           // Resume file
  { name: 'profilePicture', maxCount: 1 }  // Profile picture
]);