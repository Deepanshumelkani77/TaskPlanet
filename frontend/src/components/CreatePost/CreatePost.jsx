import React, { useState, useRef } from 'react'
import { toast } from 'react-toastify'
import './CreatePost.css'

const CreatePost = ({ onPostCreate }) => {
  const [postText, setPostText] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '👍', '👎', '👌', '✌️', '🤞', '🤟', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🙏']

  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'TaskPlanet')

    try {
      const response = await fetch(import.meta.env.VITE_CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.secure_url) {
        return data.secure_url
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw error
    }
  }

  const handleImageSelect = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      setIsUploading(true)
      
      try {
        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)

        // Upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(file)
        setImagePreview(cloudinaryUrl)
        
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload image. Please try again.')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleEmojiClick = (emoji) => {
    setPostText(prev => prev + emoji)
    setShowEmojis(false)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!postText.trim() && !imagePreview) {
      toast.error('Please add some text or an image to create a post')
      return
    }

    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/post/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          text: postText,
          image: imagePreview
        })
      })

      if (response.ok) {
        const newPost = await response.json()
        onPostCreate(newPost.post)
        setPostText('')
        setSelectedImage(null)
        setImagePreview('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        toast.success('Post created successfully! 🎉')
      } else {
        toast.error('Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Error creating post')
    }
  }

  return (
    <div className="create-post">
      <div className="create-post-container">
        <div className="create-post-header">
          <div className="header-content">
            <div className="header-icon">✨</div>
            <div className="header-text">
              <h3>Create Post</h3>
              <p className="header-subtitle">Share your amazing thoughts with the world 🌍</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="post-input-area">
            <div className="textarea-wrapper">
              <textarea
                placeholder="What's on your mind? Share your amazing thoughts, ideas, or moments... 🎯"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="post-textarea"
                rows={4}
                disabled={isUploading}
              />
              <div className="char-counter">
                <span className={postText.length > 500 ? 'char-warning' : ''}>
                  {postText.length}/500
                </span>
              </div>
            </div>
            
            {imagePreview && (
              <div className="image-preview-container">
                <div className="image-preview-wrapper">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <div className="image-overlay">
                    <button type="button" className="remove-image-btn" onClick={handleRemoveImage}>
                      <span className="remove-icon">🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {isUploading && (
              <div className="uploading-indicator">
                <div className="upload-spinner"></div>
                <span>Uploading your amazing image... 📸</span>
              </div>
            )}
          </div>

          <div className="post-actions">
            <div className="action-buttons">
              <label className="action-btn image-upload-btn">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />
                <span className="btn-icon">📷</span>
                <span className="btn-text">{isUploading ? 'Uploading...' : 'Photo'}</span>
              </label>

              <div className="emoji-container">
                <button
                  type="button"
                  className="action-btn emoji-btn"
                  onClick={() => setShowEmojis(!showEmojis)}
                  disabled={isUploading}
                >
                  <span className="btn-icon">😊</span>
                  <span className="btn-text">Emoji</span>
                </button>
                
                {showEmojis && (
                  <div className="emoji-picker">
                    <div className="emoji-header">
                      <span className="emoji-title">Choose your mood 😊</span>
                    </div>
                    <div className="emoji-grid">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          className="emoji-item"
                          onClick={() => handleEmojiClick(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className={`post-btn ${(!postText.trim() && !imagePreview) ? 'disabled' : ''}`}
              disabled={isUploading || (!postText.trim() && !imagePreview)}
            >
              {isUploading ? (
                <>
                  <div className="btn-spinner"></div>
                  Posting...
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost
