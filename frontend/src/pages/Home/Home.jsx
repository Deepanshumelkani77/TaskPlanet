import React, { useState } from 'react'
import "./Home.css"
import CreatePost from "../../components/CreatePost/CreatePost"
import ShowPost from "../../components/ShowPost/ShowPost"

const Home = () => {
  const [posts, setPosts] = useState([])

  const handlePostCreate = (newPost) => {
    // Add new post to the beginning of the posts array
    setPosts(prevPosts => [newPost, ...prevPosts])
  }

  return (
    <div>
      <CreatePost onPostCreate={handlePostCreate} />
      <ShowPost posts={posts} onPostCreate={handlePostCreate} />
    </div>
  )
}

export default Home
