import React, { useState, useEffect, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AppContext } from '../../context/Appcontext'
import './Profile.css'

const Profile = () => {
  const navigate = useNavigate()
  const { user, setUser } = useContext(AppContext)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: '',
    profileImage: ''
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchProfile()
    fetchUserPosts()
  }, [])

  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

    try {
      const response = await fetch(import.meta.env.VITE_CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Cloudinary response:', data)
      
      if (data.secure_url) {
        return data.secure_url
      } else {
        console.error('Cloudinary error response:', data)
        throw new Error(data.error?.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw error
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      console.log('File selected:', file)
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedImage) return

    setIsUploading(true)
    try {
      console.log('Starting upload for file:', selectedImage)
      const imageUrl = await uploadToCloudinary(selectedImage)
      console.log('Upload successful, URL:', imageUrl)
      
      setEditForm(prev => ({
        ...prev,
        profileImage: imageUrl
      }))
      // Keep the uploaded image as preview
      setImagePreview(imageUrl)
      setSelectedImage(null) // Clear selected image after successful upload
      setIsUploading(false)
      
      alert('Image uploaded successfully!')
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Failed to upload image: ' + error.message)
      setIsUploading(false)
    }
  }

  const handleLogout = () => {
    // Clear global user state
    setUser(null)
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Navigate to home
    navigate('/')
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setEditForm({
          username: data.user.username,
          profileImage: data.user.profileImage || ''
        })
      } else {
        setError('Failed to fetch profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Network error')
    }
  }

  const fetchUserPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/user/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
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

  const handleEditProfile = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (user) {
      setEditForm({
        username: user.username,
        profileImage: user.profileImage || ''
      })
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost:5000/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsEditing(false)
        
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(data.user))
        
        alert('Profile updated successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/user/post/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setPosts(posts.filter(post => post._id !== postId))
        alert('Post deleted successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
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
      <div className="profile">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            <h3>Loading your profile...</h3>
            <p>Fetching your amazing content 🚀</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-text">
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={() => {
              setError('')
              fetchProfile()
              fetchUserPosts()
            }}>
              <span className="btn-icon">🔄</span>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile">
      <div className="profile-container">
        {/* Profile Section */}
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-avatar">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="profile-image" />
              ) : (
                <div className="avatar-placeholder">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="online-indicator"></div>
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="edit-form">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Profile Picture</label>
                  <div className="image-upload-section">
                    <div className="current-image">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile preview" className="preview-image" />
                      ) : user?.profileImage ? (
                        <img src={user.profileImage} alt="Current profile" className="preview-image" />
                      ) : (
                        <div className="no-image-preview">
                          <span className="no-image-icon">📷</span>
                          <span>No image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="upload-controls">
                      <div className="file-input-wrapper" onClick={() => fileInputRef.current?.click()}>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          accept="image/*"
                          className="file-input"
                          id="profile-image-input"
                        />
                        <span className="file-input-label">
                          <span className="upload-icon">📁</span>
                          Choose Image
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleImageUpload}
                        disabled={!selectedImage || isUploading}
                        className="upload-btn"
                      >
                        <span className="btn-icon">{isUploading ? '⏳' : '☁️'}</span>
                        {isUploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="edit-buttons">
                  <button type="submit" className="save-btn" disabled={isUploading}>
                    <span className="btn-icon">💾</span>
                    Save Profile
                  </button>
                  <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                    <span className="btn-icon">❌</span>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <h2>
                  <span className="title-icon">👤</span>
                  {user?.username}
                </h2>
                <p className="email-text">
                  <span className="email-icon">📧</span>
                  {user?.email}
                </p>
              
                <div className="profile-actions">
                  <button onClick={handleEditProfile} className="edit-profile-btn">
                    <span className="btn-icon">✏️</span>
                    Edit Profile
                  </button>
                  <button onClick={handleLogout} className="logout-btn">
                    <span className="btn-icon">🚪</span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div className="user-posts">
          
          {posts.length === 0 ? (
            <div className="no-posts">
              <div className="no-posts-icon">📭</div>
              <div className="no-posts-content">
                <h3>No posts yet!</h3>
                <p>Start sharing your amazing thoughts with the community 🎉</p>
              </div>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map((post, index) => (
                <div key={post._id} className="post-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="post-header">
                    <div className="author-info">
                      <div className="author-avatar">
                        {user?.profileImage ? (
                          <img src={user.profileImage} alt="Profile" className="author-image" />
                        ) : (
                          <div className="avatar-placeholder">
                            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div className="online-indicator"></div>
                      </div>
                      <div className="author-details">
                        <h4>{user?.username}</h4>
                        <div className="post-meta">
                          <span className="post-time">{formatTime(post.createdAt)}</span>
                          <span className="post-separator">•</span>
                          <span className="post-visibility">🌍 Public</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeletePost(post._id)}
                      className="delete-post-btn"
                      title="Delete post"
                    >
                      <span>🗑️</span>
                    </button>
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

export default Profile
