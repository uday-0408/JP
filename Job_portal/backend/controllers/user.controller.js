import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import axios from "axios";
import cloudinary from "../utils/cloudinary.js";
// import streamifier from "streamifier";s

export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;
    console.log("Register request body:", {
      fullname,
      email,
      phoneNumber,
      password,
      role,
    });

    if (!fullname || !email || !phoneNumber || !password || !role) {
      console.log("Missing fields in register request");
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    // Check if the user exists first
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }
    
    // Handle profile picture upload if a file is provided
    let profilePictureUrl = ""; // Default empty URL
    const file = req.file;
    
    if (file) {
      console.log("Processing profile picture");
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      profilePictureUrl = cloudResponse.secure_url;
      console.log("File uploaded to Cloudinary:", profilePictureUrl);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed");

    // Create user with or without profile picture
    await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      profile: {
        profilePicture: profilePictureUrl || "", // Use the URL if file was uploaded, otherwise empty string
      },
    });

    console.log("User registered:", email);

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res
      .status(500)
      .json({ message: "Internal server error from register" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log("Login request body:", { email, password, role });

    if (!email || !password || !role) {
      console.log("Missing fields in login request");
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    let user = await User.findOne({ email: email });
    if (!user) {
      console.log("Invalid login: email not found", email);
      return res
        .status(400)
        .json({ message: "Invalid credentials (email)", success: false });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      console.log("Invalid login: password mismatch");
      return res
        .status(400)
        .json({ message: "Invalid credentials (password)", success: false });
    }

    if (role != user.role) {
      console.log("Invalid login: role mismatch", {
        provided: role,
        actual: user.role,
      });
      return res
        .status(400)
        .json({ message: "Invalid credentials (role)", success: false });
    }

    const tokenData = { userId: user._id };
    const token = jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });
    console.log("JWT Token generated");

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile || {},
    };

    console.log("User logged in:", user);

    return res
      .status(200)
      .cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true })
      .json({
        massage: `Login successful ,Welcome back ${user.fullname}`,
        user,
        success: true,
      });
  } catch (error) {
    console.error("Error during login:", error);
    return res
      .status(500)
      .json({ message: "Internal server error from login", success: false });
  }
};

export const logOut = async (req, res) => {
  try {
    console.log("User logging out");
    res.clearCookie("token");
    return res.status(200).json({
      message: "Logout successful",
      success: true,
    });
  } catch (error) {
    console.error("Error during logout:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;

    // Get files from multer (now using .files instead of .file)
    const resumeFile = req.files?.file?.[0];
    const profilePictureFile = req.files?.profilePicture?.[0];
    
    let cloudResponse = null;
    let profilePictureUrl = null;

    // Process resume file if it exists
    if (resumeFile) {
      console.log("📥 Resume File Received in Backend:");
      console.log("  Name:", resumeFile.originalname);
      console.log("  Mimetype:", resumeFile.mimetype);
      console.log("  Buffer Length:", resumeFile.buffer?.length);

      // Instead of uploading to Cloudinary, forward the resume to the Django resume upload endpoint
      try {
        // Add extensive debugging for connection
        console.log("DJANGO_END_POINT from env:", process.env.DJANGO_END_POINT);
        
        // Try to use env var, but with strong fallback to ensure it works
        let djangoUrl = process.env.DJANGO_END_POINT ? 
          `${process.env.DJANGO_END_POINT.replace(/\/+$/, "")}/upload_resume/` : 
          "http://localhost:5000/api/upload_resume/";
          
        // Ensure we're using port 5000 - if env var has a different port, log a warning
        if (!djangoUrl.includes('localhost:5000') && !djangoUrl.includes('127.0.0.1:5000')) {
          console.warn("WARNING: Django URL from env doesn't specify port 5000. Using port 5000 instead.");
          djangoUrl = "http://localhost:5000/api/upload_resume/";
        }
        
        console.log("Attempting to connect to Django URL:", djangoUrl);
          
        // Import FormData properly in ESM
        const FormDataModule = await import('form-data');
        const FormData = FormDataModule.default;
        const form = new FormData();
        form.append('file', resumeFile.buffer, { filename: resumeFile.originalname, contentType: resumeFile.mimetype });

        console.log("FormData created successfully with file");
        const headers = form.getHeaders();
        console.log("Request headers:", headers);

        console.log("Sending POST request to Django...");
        console.log("Request URL:", djangoUrl);
        
        const djangoRes = await axios.post(djangoUrl, form, {
          headers,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 10000, // 10-second timeout for clarity,
          validateStatus: status => true // Accept any status to see what Django returns
        });        // Log full response details regardless of outcome
        console.log('Django response status:', djangoRes.status);
        console.log('Django response headers:', djangoRes.headers);
        console.log('Django response data:', djangoRes.data);
        
        if (djangoRes.status >= 400) {
          console.error(`Django returned error status ${djangoRes.status}:`, djangoRes.data);
          throw new Error(`Django server error: ${djangoRes.status} - ${JSON.stringify(djangoRes.data)}`);
        }
        
        if (djangoRes?.data?.id) {
          cloudResponse = { resumeId: djangoRes.data.id };
          console.log('Resume uploaded to Django, id:', djangoRes.data.id);
        } else {
          console.warn('Django upload did not return expected id format. Response:', djangoRes.data);
        }
      } catch (djangoErr) {
        console.error('Error uploading resume to Django endpoint:', djangoErr?.message);
        
        // Network error detailed debugging
        if (djangoErr.code) {
          console.error('Error code:', djangoErr.code);
        }
        
        if (djangoErr.config) {
          console.error('Request was made to:', djangoErr.config.url);
          console.error('Request method:', djangoErr.config.method);
        }
        
        if (djangoErr.code === 'MODULE_NOT_FOUND') {
          console.error('Missing npm module. Please run: npm install form-data axios');
        } else if (djangoErr.code === 'ECONNREFUSED') {
          console.error('Connection refused. Make sure Django server is running at', process.env.DJANGO_END_POINT);
          console.error('Check that your Django port matches the .env DJANGO_END_POINT setting');
        }
        
        // Print stack regardless
        console.error('Stack trace:', djangoErr.stack);
      }
    }

    let skillsArray;
    if (skills) {
      skillsArray = skills.split(",");
    }
    const userId = req.id; // middleware authentication
    let user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found.",
        success: false,
      });
    }
    // updating data
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;
    
    // Direct resumeId update (when provided without a file)
    if (req.body.resumeId) {
      user.profile.resumeId = req.body.resumeId;
      console.log("Resume ID updated from form data:", req.body.resumeId);
    }
    
    // Direct resumeOriginalName update (when provided without a file)
    if (req.body.resumeOriginalName) {
      user.profile.resumeOriginalName = req.body.resumeOriginalName;
      console.log("Resume original name updated from form data:", req.body.resumeOriginalName);
    }

    // Update resume if a file was uploaded successfully to Django
    if (cloudResponse && cloudResponse.resumeId) {
      // store the returned Django resume id and the original filename for reference
      user.profile.resumeId = cloudResponse.resumeId;
      user.profile.resumeOriginalName = resumeFile.originalname;
      console.log("Resume recorded with Django id:", cloudResponse.resumeId);
    }
    
    // Handle profile picture upload (to Cloudinary)
    if (profilePictureFile) {
      console.log("🖼️ Profile Picture Received in Backend:");
      console.log("  Name:", profilePictureFile.originalname);
      console.log("  Mimetype:", profilePictureFile.mimetype);
      console.log("  Buffer Length:", profilePictureFile.buffer?.length);
      
      try {
        // Get data URI from file
        const fileUri = getDataUri(profilePictureFile);
        if (!fileUri || !fileUri.content) {
          throw new Error("Failed to convert file to Data URI");
        }
        
        // Debug cloudinary
        console.log("Cloudinary object:", typeof cloudinary);
        console.log("Cloudinary uploader:", typeof cloudinary?.uploader);
        
        // Re-import cloudinary directly here as a fallback
        if (!cloudinary || !cloudinary.uploader) {
          console.warn("Cloudinary import failed, trying direct import...");
          const { v2: directCloudinary } = await import('cloudinary');
          
          // Configure directly
          directCloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });
          
          // Upload using direct import
          const result = await directCloudinary.uploader.upload(fileUri.content, {
            folder: "job_portal/profile_pictures",
            public_id: `profile_${user._id}_${Date.now()}`,
            overwrite: true,
          });
          
          // Update user with new profile picture URL
          user.profile.profilePicture = result.secure_url;
          console.log("Profile picture uploaded to Cloudinary (direct import):", result.secure_url);
        } else {
          // Upload to Cloudinary using the imported module
          const result = await cloudinary.uploader.upload(fileUri.content, {
            folder: "job_portal/profile_pictures",
            public_id: `profile_${user._id}_${Date.now()}`,
            overwrite: true,
          });
          
          // Update user with new profile picture URL
          user.profile.profilePicture = result.secure_url;
          console.log("Profile picture uploaded to Cloudinary:", result.secure_url);
        }
      } catch (cloudinaryError) {
        console.error("Error uploading profile picture to Cloudinary:", cloudinaryError);
        console.error("Stack trace:", cloudinaryError.stack);
        // Use a default profile picture as fallback
        console.log("Using default profile picture as fallback");
        // Don't update profile picture on error, leave existing one
      }
    }

    await user.save();

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res.status(200).json({
      message: "Profile updated successfully.",
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const autoLogin = async (req, res) => {
  try {
    const token = req.cookies.token;
    console.log("Auto-login token received:", token);
    if (!token) {
      return res.status(401).json({
        message: "Not authenticated. Please log in.",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    return res.status(200).json({
      message: `User logged in successfully (auto-login). Welcome back ${user.fullname}`,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error during auto-login:", error);
    return res.status(500).json({
      message: "Internal server error during auto-login",
      success: false,
    });
  }
};
