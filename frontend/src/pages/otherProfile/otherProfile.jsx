import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import './OtherProfile.css'

const OtherProfile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    fetchUserProfile()
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      // Prepare headers with optional authorization
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`http://localhost:5000/user/user/${userId}`, {
        headers
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setPosts(data.posts || [])
      } else {
        setError('User not found')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    return date.toLocaleDateString()
  }

  const handleLike = async (postId) => {
    if (!token) {
      toast.error('Please login to like posts')
      navigate('/login')
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/post/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Update the post in local state
        setPosts(posts.map(post => 
          post._id === postId 
            ? { ...post, liked: data.liked, likes: data.likes }
            : post
        ))
        
        // Show success message
        if (data.liked) {
          toast.success('Post liked! ❤️')
        } else {
          toast.info('Post unliked')
        }
      } else {
        toast.error('Failed to like post')
      }
    } catch (error) {
      console.error('Like error:', error)
      toast.error('Network error. Please try again.')
    }
  }

  const handleCommentClick = (postId) => {
    navigate(`/comment/${postId}`)
  }

  if (loading) {
    return (
      <div className="other-profile">
        <div className="loading">Loading profile...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="other-profile">
        <div className="back-button">
          <button onClick={() => navigate('/')}>
            ← Back to Feed
          </button>
        </div>
        <div className="error">{error}</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="other-profile">
        <div className="back-button">
          <button onClick={() => navigate('/')}>
            ← Back to Feed
          </button>
        </div>
        <div className="error">User not found</div>
      </div>
    )
  }

  return (
    <div className="other-profile">
      <div className="back-button">
        <button onClick={() => navigate('/')}>
          ← Back to Feed
        </button>
      </div>

      <div className="profile-container">
        {/* Profile Header Section */}
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-avatar">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.username} className="profile-image" />
              ) : (
                <div className="avatar-placeholder">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div className="profile-details">
              <h2>{user.username}</h2>
              <p>Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="user-posts">
          <div className="posts-header">
            <h3>
              <span className="title-icon">📝</span>
              {user.username}'s Posts
            </h3>
            <p className="posts-subtitle">Amazing content from this user 🎨</p>
          </div>
          {posts.length === 0 ? (
            <div className="no-posts">
              <div className="no-posts-icon">📭</div>
              <div className="no-posts-content">
                <h3>No posts yet!</h3>
                <p>This user hasn't shared any content yet 🤔</p>
              </div>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post, index) => (
                <div key={post._id} className="post-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="post-header">
                    <div className="author-info">
                      <div className="author-avatar">
                        {post.author.userId && post.author.userId.profileImage ? (
                          <img 
                            src={post.author.userId.profileImage} 
                            alt={`${post.author.username}'s profile`} 
                            className="author-profile-image"
                            onClick={() => navigate(`/user/${post.author.userId._id}`)}
                          />
                        ) : (
                          <div 
                            className="author-avatar-placeholder"
                            onClick={() => navigate(`/user/${post.author.userId._id}`)}
                          >
                            {post.author.username ? post.author.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div className="online-indicator"></div>
                      </div>
                      <div className="author-details">
                        <h4 className="author-name">{post.author.username}</h4>
                        <div className="post-meta">
                          <span className="post-time">{formatTime(post.createdAt)}</span>
                          <span className="post-separator">•</span>
                          <span className="post-visibility">🌍 Public</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="post-content">
                    {post.text && (
                      <div className="post-text-container">
                        <p className="post-text">{post.text}</p>
                      </div>
                    )}
                    
                    {post.image && (
                      <div className="post-image-container">
                        <img 
                          src={post.image} 
                          alt="Post image" 
                          className="post-image"
                          loading="lazy"
                        />
                        <div className="image-overlay">
                          <button className="expand-btn">
                            <span>🔍</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="post-actions">
                    <div className="action-buttons">
                      <button 
                        className={`like-btn ${post.liked ? 'liked' : ''}`}
                        onClick={() => handleLike(post._id)}
                      >
                        <span className="like-icon">
                          {post.liked ? '❤️' : '🤍'}
                        </span>
                        <span className="like-count">
                          {post.likes ? post.likes.length : 0}
                        </span>
                        <span className="action-label">Like</span>
                      </button>
                      
                      <button 
                        className="comment-btn"
                        onClick={() => handleCommentClick(post._id)}
                      >
                        <span className="comment-icon">💬</span>
                        <span className="comment-count">
                          {post.comments ? post.comments.length : 0}
                        </span>
                        <span className="action-label">Comments</span>
                      </button>
                    </div>
                    
                    <div className="post-stats">
                      <span className="engagement-text">
                        {post.likes && post.likes.length > 0 && (
                          <span className="likes-text">
                            {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                          </span>
                        )}
                        {post.likes && post.likes.length > 0 && post.comments && post.comments.length > 0 && ' • '}
                        {post.comments && post.comments.length > 0 && (
                          <span className="comments-text">
                            {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OtherProfile