import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AppContext } from '../../context/Appcontext'
import './ShowPost.css'

const ShowPost = ({ posts: externalPosts }) => {
  const navigate = useNavigate()
  const { user } = useContext(AppContext)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPosts()
  }, []) // Initial fetch

  // Refetch posts when user logs in/out
  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [user]) // Fetch when user changes

  // Update posts when new post is created
  useEffect(() => {
    if (externalPosts && externalPosts.length > 0) {
      // Add new posts to the beginning of existing posts
      setPosts(prevPosts => {
        const existingPostIds = new Set(prevPosts.map(post => post._id))
        const newPosts = externalPosts.filter(post => !existingPostIds.has(post._id))
        return [...newPosts, ...prevPosts]
      })
    }
  }, [externalPosts])

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/post/all', {
        headers
      })
      const data = await response.json()
      
      if (response.ok) {
        setPosts(data.posts || [])
      } else {
        setError('Failed to fetch posts')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login to like posts')
        return
      }

      const response = await fetch(import.meta.env.VITE_BACKEND_URL + `/post/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Update post in local state
        setPosts(posts.map(post => 
          post._id === postId 
            ? { ...post, likes: data.likes, liked: data.liked }
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

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (loading) {
    return (
      <div className="show-post">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            <h3>Loading amazing posts...</h3>
            <p>Fetching the latest content from our community 🚀</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="show-post">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-text">
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchPosts}>
              <span className="btn-icon">🔄</span>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="show-post">
     
      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="no-posts-container">
            <div className="no-posts-icon">📝</div>
            <div className="no-posts-content">
              <h3>No posts yet!</h3>
              <p>Be the first to share something amazing with our community 🎉</p>
              <button className="create-first-post-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <span className="btn-icon">✨</span>
                Create First Post
              </button>
            </div>
          </div>
        ) : (
          posts.map((post, index) => (
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
                <div className="post-options">
                  
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
                  
                  <button className="comment-btn" onClick={() => handleCommentClick(post._id)}>
                    <span className="comment-icon">💬</span>
                    <span className="comment-count">
                      {post.comments ? post.comments.length : 0}
                    </span>
                    <span className="action-label">Comment</span>
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
          ))
        )}
      </div>
    </div>
  )
}

export default ShowPost
