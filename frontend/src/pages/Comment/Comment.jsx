import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AppContext } from '../../context/Appcontext'
import './Comment.css'

const Comment = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AppContext)
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    fetchPostAndComments()
  }, [postId])

  const fetchPostAndComments = async () => {
    try {
      // Prepare headers with optional authorization
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      // Fetch post details
      const postResponse = await fetch(`http://localhost:5000/post/${postId}`, {
        headers
      })
      const postData = await postResponse.json()
      
      if (postResponse.ok) {
        setPost(postData.post)
      } else {
        setError('Failed to fetch post')
        return
      }

      // Fetch comments
      const commentsResponse = await fetch(`http://localhost:5000/comment/${postId}`, {
        headers
      })
      const commentsData = await commentsResponse.json()
      
      if (commentsResponse.ok) {
        setComments(commentsData.comments || [])
      } else {
        console.error('Failed to fetch comments')
        setComments([]) // Set empty array on error
      }
      
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Network error')
      setComments([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    
    if (!newComment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    if (!token) {
      toast.error('Please login to comment')
      return
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'))

      const response = await fetch(`http://localhost:5000/comment/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: newComment,
          author: {
            userId: user.id,
            username: user.username
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setComments([data.comment, ...comments])
        setNewComment('')
        toast.success('Comment posted successfully! 💬')
        // Refresh comments to ensure we have the latest data
        fetchPostAndComments()
      } else {
        toast.error('Failed to post comment')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Network error. Please try again.')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!token) {
      toast.error('Please login to delete comments')
      alert('Please login to delete comments')
      return
    }

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Remove comment from local state
        setComments(comments.filter(comment => comment._id !== commentId))
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Error deleting comment')
    }
  }

  const isCommentAuthor = (comment) => {
    return user && comment.userId && comment.userId._id === user.id
  }

  const handleLike = async () => {
    try {
      const response = await fetch(`http://localhost:5000/post/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Update post in local state
        setPost(prev => ({
          ...prev,
          likes: data.likes,
          liked: data.liked
        }))
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
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
      <div className="comment-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            <h3>Loading amazing content...</h3>
            <p>Fetching post and comments from our community 🚀</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="comment-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-text">
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchPostAndComments}>
              <span className="btn-icon">🔄</span>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="comment-page">
        <div className="error-container">
          <div className="error-icon">🔍</div>
          <div className="error-text">
            <h3>Post Not Found</h3>
            <p>This post doesn't exist or has been removed</p>
            <button className="back-btn" onClick={() => navigate('/')}>
              <span className="btn-icon">🏠</span>
              Back to Feed
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="comment-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <span className="btn-icon">←</span>
          Back to Feed
        </button>
        <div className="header-title">
          <h2>
            <span className="title-icon">💬</span>
            Post Discussion
          </h2>
          <p className="header-subtitle">Join the conversation with our community</p>
        </div>
      </div>

      <div className="content-container">
        <div className="post-detail">
          <div className="post-card">
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
                  onClick={handleLike}
                >
                  <span className="like-icon">
                    {post.liked ? '❤️' : '🤍'}
                  </span>
                  <span className="like-count">
                    {post.likes ? post.likes.length : 0}
                  </span>
                  <span className="action-label">Like</span>
                </button>
                
                <button className="comment-btn">
                  <span className="comment-icon">💬</span>
                  <span className="comment-count">
                    {comments.length}
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
                  {post.likes && post.likes.length > 0 && comments.length > 0 && ' • '}
                  {comments.length > 0 && (
                    <span className="comments-text">
                      {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="comments-section">
          <div className="comments-header">
            <h3 className="comments-title">
              <span className="title-icon">💭</span>
              Comments ({comments.length})
            </h3>
            <p className="comments-subtitle">Share your thoughts and join the discussion</p>
          </div>
          
          <div className="comment-form-container">
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <div className="input-wrapper">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this post... 💭"
                  className="comment-input"
                  rows={4}
                  disabled={!token}
                />
                <div className="input-actions">
                  <span className="char-counter">
                    <span className={newComment.length > 500 ? 'char-warning' : ''}>
                      {newComment.length}/500
                    </span>
                  </span>
                  <button 
                    type="submit" 
                    className={`comment-submit-btn ${!newComment.trim() ? 'disabled' : ''}`}
                    disabled={!token || !newComment.trim()}
                  >
                    <span className="btn-icon">📤</span>
                    {token ? 'Post Comment' : 'Login to Comment'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments-container">
                <div className="no-comments-icon">💬</div>
                <div className="no-comments-content">
                  <h3>No comments yet!</h3>
                  <p>Be the first to share your thoughts on this amazing post 🎉</p>
                </div>
              </div>
            ) : (
              comments.map((comment, index) => (
                <div key={comment._id} className="comment-item" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="comment-header">
                    <div className="comment-avatar">
                      {comment.userId && comment.userId.profileImage ? (
                        <img 
                          src={comment.userId.profileImage} 
                          alt={`${comment.username}'s profile`} 
                          className="comment-profile-image"
                          onClick={() => navigate(`/user/${comment.userId._id}`)}
                        />
                      ) : (
                        <div 
                          className="comment-avatar-placeholder"
                          onClick={() => navigate(`/user/${comment.userId._id}`)}
                        >
                          {comment.username ? comment.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="online-indicator"></div>
                    </div>
                    <div className="comment-author">
                      <h5>{comment.username}</h5>
                      <span className="comment-time">{formatTime(comment.createdAt)}</span>
                    </div>
                    {isCommentAuthor(comment) && (
                      <div className="comment-actions">
                        <button 
                          className="delete-comment-btn"
                          onClick={() => handleDeleteComment(comment._id)}
                          title="Delete comment"
                        >
                          <span>🗑️</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="comment-content">
                    <p>{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Comment
