const express = require("express");
const router = express.Router();
const { signup, login, getProfile, updateProfile, getUserPosts, deletePost, getOtherUserProfile, verifyToken } = require("../controller/userController");

// Optional authentication middleware
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, 'Dev_Melkani_Secret_Key');
      req.user = decoded;
    } catch (error) {
      // Token is invalid, but we continue without user
      req.user = null;
    }
  } else {
    req.user = null;
  }
  
  next();
};

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/posts', verifyToken, getUserPosts);
router.delete('/post/:postId', verifyToken, deletePost);

// Public route for other user profiles (optional authentication for like status)
router.get('/user/:userId', optionalAuth, getOtherUserProfile);

module.exports = router;