import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
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

    const file = req.file;
    let cloudResponse = null;

    // Only process file if it exists
    if (file) {
      console.log("📥 File Received in Backend:");
      console.log("  Name:", file.originalname);
      console.log("  Mimetype:", file.mimetype);
      console.log("  Buffer Length:", file.buffer?.length);

      // Upload to cloudinary only if file exists
      const fileUri = getDataUri(file);
      if (fileUri) {
        cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
          resource_type: "raw",
          folder: "Job Portal",
          public_id: `Job Portal/${file.originalname}`,
          use_filename: true,
          unique_filename: false,
        });
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

    // Update resume only if a file was uploaded successfully
    if (cloudResponse) {
      user.profile.resume = cloudResponse.secure_url; // save the cloudinary url
      user.profile.resumeOriginalName = file.originalname; // Save the original file name
      console.log("Resume uploaded to Cloudinary:", cloudResponse.secure_url);
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
