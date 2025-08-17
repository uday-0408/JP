// const jwt=require("jsonwebtoken");
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized access, token missing" });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Unauthorized access, invalid token" });
    }
    req.id = decoded.userId;
    console.log("Decoded token:", decoded);
    console.log("Assigned req.id:", req.id);
    next();
  } catch (error) {
    console.error("Error in isAuthenticated middleware:", error);
    return res
      .status(500)
      .json({ message: "Internal server error from middleware" });
  }
};

export default isAuthenticated;
