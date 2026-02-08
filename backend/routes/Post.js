const express = require("express");
const router = express.Router();
const { createPost, getAllPosts, likePost, getPost, verifyToken } = require("../controller/postController");

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

// Routes
router.post('/create', verifyToken, createPost);
router.get('/all', optionalAuth, getAllPosts);
router.get('/:postId', optionalAuth, getPost);
router.post('/:postId/like', verifyToken, likePost);

module.exports = router;