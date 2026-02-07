const Comment = require("../models/Comment");
const Post = require("../models/Post");
const { verifyToken } = require("./userController");

// Create Comment
const createComment = async (req, res) => {
  try {
    console.log("Create comment request body:", req.body);
    
    const { text } = req.body;
    const postId = req.params.postId;
    const userId = req.user.userId;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required"
      });
    }

    // Get user info for username
    const User = require("../models/User");
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Create new comment - match the Comment model structure
    const newComment = new Comment({
      text: text.trim(),
      userId: userId,  // Direct field in Comment model
      username: user.username,  // Direct field in Comment model
      post: postId
    });

    await newComment.save();

    // Add comment to post's comments array
    await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: newComment._id } },
      { new: true }
    );

    // Populate author info for response
    const populatedComment = await Comment.findById(newComment._id)
      .populate("userId", "username profileImage")
      .populate("post", "text");

    res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment
    });

  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({
      message: "Server error while creating comment"
    });
  }
};

// Get Comments for a Post
const getComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    
    const comments = await Comment.find({ post: postId })
      .populate("userId", "username profileImage")  // Include profileImage
      .sort({ createdAt: 1 }) // Oldest first for comments
      .limit(50); // Limit to 50 comments

    res.status(200).json({
      comments,
      message: "Comments retrieved successfully"
    });

  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      message: "Server error while fetching comments"
    });
  }
};

// Delete Comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    // Find comment and check if it belongs to user
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: 'Comment not found'
      });
    }

    // Check if user is the author of the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        message: 'Not authorized to delete this comment'
      });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      message: 'Server error while deleting comment'
    });
  }
};

module.exports = {
  createComment,
  getComments,
  deleteComment,
  verifyToken
};
