const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT Secret Key (in production, use environment variable)
const JWT_SECRET = 'your-secret-key-here';

// Register User
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profileImage: newUser.profileImage
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      message: 'Server error during signup'
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login'
    });
  }
};

// Get User Profile (protected route)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { username, profileImage } = req.body;
    const userId = req.user.userId;

    const User = require('../models/User');
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          message: 'Username already taken'
        });
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username: username || user.username,
        profileImage: profileImage || user.profileImage
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Server error while updating profile'
    });
  }
};

// Get User's Posts
const getUserPosts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const Post = require('../models/Post');

    const posts = await Post.find({ 'author.userId': userId })
      .populate('author.userId', 'username profileImage')
      .populate('likes', 'username')
      .populate('comments')
      .sort({ createdAt: -1 }) // Newest first
      .limit(50);

    // Add liked status for each post
    const postsWithLikeStatus = posts.map(post => ({
      ...post.toObject(),
      liked: post.likes.some(like => like._id.toString() === userId)
    }));

    res.status(200).json({
      posts: postsWithLikeStatus,
      message: 'User posts retrieved successfully'
    });

  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      message: 'Server error while fetching user posts'
    });
  }
};

// Delete User's Post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const Post = require('../models/Post');

    // Find post and check if it belongs to user
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    if (post.author.userId.toString() !== userId) {
      return res.status(403).json({
        message: 'Not authorized to delete this post'
      });
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      message: 'Server error while deleting post'
    });
  }
};

// Get Other User's Profile
const getOtherUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user ? req.user.userId : null;
    const User = require('../models/User');
    const Post = require('../models/Post');

    // Find user by ID
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Get user's posts
    const posts = await Post.find({ 'author.userId': userId })
      .populate('author.userId', 'username profileImage')
      .populate('likes', 'username')
      .populate('comments')
      .sort({ createdAt: -1 })
      .limit(50);

    // Add liked status for each post
    const postsWithLikeStatus = posts.map(post => ({
      ...post.toObject(),
      liked: currentUserId ? post.likes.some(like => like._id.toString() === currentUserId) : false
    }));

    res.status(200).json({
      user,
      posts: postsWithLikeStatus,
      message: 'User profile retrieved successfully'
    });

  } catch (error) {
    console.error('Get other user profile error:', error);
    res.status(500).json({
      message: 'Server error while fetching user profile'
    });
  }
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  
  const token = req.header('Authorization')?.replace('Bearer ', '');
  

  if (!token) {
    console.log('VerifyToken - No token found');
    return res.status(401).json({
      message: 'No token, authorization denied'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('VerifyToken - Decoded:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('VerifyToken - Error:', error.message);
    res.status(401).json({
      message: 'Token is not valid'
    });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  getUserPosts,
  deletePost,
  getOtherUserProfile,
  verifyToken
};