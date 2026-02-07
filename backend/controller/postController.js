const Post = require('../models/Post');
const { verifyToken } = require('./userController');
 const User = require('../models/User');

// Create Post
const createPost = async (req, res) => {
  try {
    
    
    const text = req.body.text || '';
    const image = req.body.image || '';
    const userId = req.user.userId;
    
    
    
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Create new post
    const newPost = new Post({
      text,
      image: image || null,
      author: {
        userId: userId,
        username: user.username
      },
      likes: [],
      comments: []
    });

    await newPost.save();

    // Populate author info for response
    const populatedPost = await Post.findById(newPost._id)
      .populate('author.userId', 'username profileImage')
      .populate('likes', 'username')
      .populate('comments', 'text author');

    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      message: 'Server error while creating post'
    });
  }
};

// Get All Posts (Feed)
const getAllPosts = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null;
    const posts = await Post.find()
      .populate('author.userId', 'username profileImage')
      .populate('likes', 'username')
      .populate('comments')
      .sort({ createdAt: -1 });

    const postsWithLikeStatus = posts.map(post => ({
      ...post.toObject(),
      liked: userId ? post.likes.some(like => like._id.toString() === userId) : false
    }));

    res.status(200).json({
      posts: postsWithLikeStatus,
      message: 'Posts retrieved successfully'
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      message: 'Server error while fetching posts'
    });
  }
};

// Like Post
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    // Check if user already liked post
    const alreadyLiked = post.likes.includes(userId);
    
    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    // Get updated user info
    const User = require('../models/User');
    const user = await User.findById(userId);

    res.status(200).json({
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes.length,
      liked: !alreadyLiked,
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      message: 'Server error while liking post'
    });
  }
};

// Get Single Post
const getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user ? req.user.userId : null;
    
    const post = await Post.findById(postId)
      .populate('author.userId', 'username profileImage')
      .populate('likes', 'username')
      .populate('comments');

    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    // Add liked status for the post
    const postWithLikeStatus = {
      ...post.toObject(),
      liked: userId ? post.likes.some(like => like._id.toString() === userId) : false
    };

    res.status(200).json({
      post: postWithLikeStatus,
      message: 'Post retrieved successfully'
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      message: 'Server error while fetching post'
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  likePost,
  getPost,
  verifyToken
};