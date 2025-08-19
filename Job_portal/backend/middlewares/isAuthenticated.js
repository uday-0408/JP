// const jwt=require("jsonwebtoken");
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const isAuthenticated = (req, res, next) => {
  try {
    // Log request details for debugging
    console.log("🔍 Auth middleware - URL:", req.originalUrl);
    console.log("🔍 Auth middleware - Method:", req.method);
    console.log("🔍 Auth middleware - Headers:", {
      cookie: req.headers.cookie,
      authorization: req.headers.authorization,
      'content-type': req.headers['content-type']
    });
    console.log("🔍 Auth middleware - Cookies:", req.cookies);
    
    const token = req.cookies?.token;
    if (!token) {
      console.log("❌ Auth middleware - No token found in cookies");
      
      // Check if token might be in Authorization header instead
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const headerToken = authHeader.substring(7);
        console.log("🔍 Found token in Authorization header:", headerToken.substring(0, 10) + "...");
        
        try {
          const decoded = jwt.verify(headerToken, process.env.SECRET_KEY);
          req.id = decoded.userId;
          console.log("✅ Auth middleware - Token from header verified:", decoded);
          next();
          return;
        } catch (headerTokenError) {
          console.log("❌ Auth middleware - Invalid token from header:", headerTokenError.message);
        }
      }
      
      return res
        .status(401)
        .json({ message: "Unauthorized access, token missing" });
    }
    
    console.log("✅ Auth middleware - Token found in cookies:", token.substring(0, 10) + "...");
    
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      console.log("✅ Auth middleware - Token decoded:", decoded);
      req.id = decoded.userId;
      next();
      return;
    } catch (tokenError) {
      console.log("❌ Auth middleware - Token verification failed:", tokenError.message);
      return res
        .status(401)
        .json({ message: "Unauthorized access, invalid token: " + tokenError.message });
    }
    
    req.id = decoded.userId;
    console.log("✅ Auth middleware - Decoded token:", decoded);
    console.log("✅ Auth middleware - Assigned req.id:", req.id);
    next();
  } catch (error) {
    console.error("❌ Auth middleware - Error:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return res
        .status(401)
        .json({ message: "Invalid token format or signature" });
    } else if (error.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({ message: "Token has expired, please login again" });
    }
    
    return res
      .status(500)
      .json({ message: "Internal server error from middleware" });
  }
};

export default isAuthenticated;
