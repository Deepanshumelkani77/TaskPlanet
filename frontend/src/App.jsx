import React, { useContext, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import "./App.css"
import Home from "./pages/Home/Home.jsx";
import Navbar from "./components/Navbar/Navbar.jsx"
import { AppContext } from './context/Appcontext.jsx';
import Login from './components/Login/Login.jsx';
import Comment from './pages/Comment/Comment.jsx';
import Profile from './pages/Profile/Profile.jsx';
import OtherProfile from './pages/OtherProfile/OtherProfile.jsx';

const App = () => {
  const { openLogin, setOpenLogin, user, setUser } = useContext(AppContext);

  useEffect(() => {
    // Check for stored user data on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData && !user) {
      setUser(JSON.parse(userData));
    }
  }, [user, setUser]);

  // Show login modal if user is not logged in
  useEffect(() => {
    if (!user) {
      setOpenLogin(true);
    }
  }, [user, setOpenLogin]);

  return (
    <div className="app">
      {/* Always show home page in background (will be blurred by login overlay) */}
      <Navbar/>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/comment/:postId" element={<Comment/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/user/:userId" element={<OtherProfile/>} />
        </Routes>
      </main>
      
      {/* Show login modal on top when user is not authenticated */}
      {!user && <Login />}
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  )
}

export default App
