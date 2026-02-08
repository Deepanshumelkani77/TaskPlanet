const express=require("express");
const cors=require("cors");
const multer = require('multer');
require('dotenv').config();

const app=express();
app.listen(5000,()=>{
    console.log("Server is running on port 5000");
})


//database connection
const mongoose = require("mongoose");
 const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI );
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Error connecting to database:", error);
      process.exit(1);
    }
  };
//db connectin model
connectDB();



// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173',"https://task-planet.vercel.app/"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



// Handle both JSON and form-data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});



const user=require("./routes/User.js");
app.use("/user",user);
const post=require("./routes/Post.js");
app.use("/post",post);
const comment=require("./routes/Comment.js");
app.use("/comment",comment);