import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { toggleBookmark, getBookmarkedJobs, isJobBookmarked } from '../controllers/bookmark.controller.js';

const router = express.Router();

// Test route to check authentication
router.get('/test-auth', isAuthenticated, (req, res) => {
  console.log("📝 Auth Test Route - User ID:", req.id);
  return res.status(200).json({ 
    message: "Authentication successful", 
    userId: req.id,
    success: true 
  });
});

// Public route to check cookie presence without auth middleware
router.get('/cookie-check', (req, res) => {
  console.log("🍪 Cookie Check Route");
  console.log("🍪 Cookies:", req.cookies);
  console.log("🍪 Headers:", {
    cookie: req.headers.cookie,
    authorization: req.headers.authorization,
    origin: req.headers.origin,
    referer: req.headers.referer
  });
  
  const hasTokenCookie = !!req.cookies?.token;
  
  return res.status(200).json({
    message: hasTokenCookie ? "Cookie found" : "Cookie missing",
    cookiePresent: hasTokenCookie,
    cookieCount: Object.keys(req.cookies || {}).length,
    success: true
  });
});

// Toggle bookmark status (add or remove)
router.post('/toggle', isAuthenticated, toggleBookmark);

// Get all bookmarked jobs for the current user
router.get('/jobs', isAuthenticated, getBookmarkedJobs);

// Check if a job is bookmarked by the current user
router.get('/status/:jobId', isAuthenticated, isJobBookmarked);

export default router;
