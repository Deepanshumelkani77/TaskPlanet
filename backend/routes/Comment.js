const express = require("express");
const router = express.Router();
const { createComment, getComments, deleteComment, verifyToken } = require("../controller/commentController");

// Protected routes (require authentication)
router.post('/:postId', verifyToken, createComment);
router.get('/:postId', getComments);
router.delete('/:commentId', verifyToken, deleteComment);

module.exports = router;