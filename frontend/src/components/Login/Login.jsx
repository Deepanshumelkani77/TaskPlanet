import React, { useState, useContext } from 'react'
import { toast } from 'react-toastify'
import './Login.css'
import { AppContext } from '../../context/Appcontext'

const Login = () => {
  const { setOpenLogin, setUser } = useContext(AppContext)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const endpoint = isLogin ? 'login' : 'signup'
    const url = `http://localhost:5000/user/${endpoint}`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          setUser(data.user)
          setOpenLogin(false)
          toast.success('Login successful! Welcome back! 🎉')
        } else {
          toast.success('Account created successfully! Please login. 🎊')
          setIsLogin(true)
          setFormData({ email: '', password: '', username: '', confirmPassword: '' })
        }
      } else {
        toast.error(data.message || 'Something went wrong')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Network error. Please try again.')
    }
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
    setFormData({ email: '', password: '', username: '', confirmPassword: '' })
  }

  const handleCloseModal = () => {
    // Don't allow closing the modal - user must login
    // This is now a login-first flow
  }

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <div className="login-container">
          <div className="login-header">
            <h2 className="login-title">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="login-subtitle">
              {isLogin 
                ? 'Connect with friends and share your moments' 
                : 'Join TaskPlanet and start sharing'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            )}

            <button type="submit" className="login-btn">
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="login-footer">
            <p className="toggle-text">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button" 
                onClick={toggleForm}
                className="toggle-btn"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login