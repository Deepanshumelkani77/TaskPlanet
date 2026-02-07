import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import "./Navbar.css"
import { AppContext } from '../../context/Appcontext'


const Navbar = () => {
  const { user, setUser, setOpenLogin } = useContext(AppContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setOpenLogin(false)
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h1>
            <span className="task-text">Task</span>
            <span className="planet-text">Planet</span>
          </h1>
        </Link>

        <div className="navbar-actions">
          {user && user.username ? (
            <div className="user-menu">
              <div className="profile-info">
                <span className="username">{user.username}</span>
                <Link to="/profile" className="profile-icon" title="Profile">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="profile-avatar-img" />
                  ) : (
                    <span className="profile-avatar-text">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="login-btn" onClick={() => setOpenLogin(true)}>
               Signup
              </button>
      
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
