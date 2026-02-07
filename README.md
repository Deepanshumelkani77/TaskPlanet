# Taskplanet - Social Media Platform

A modern, responsive social media platform built with React and Node.js, featuring user profiles, posts, comments, and real-time interactions.

## 🌟 Features

### Core Functionality
- **User Authentication** - Secure login/signup system
- **Profile Management** - Edit profiles with image uploads
- **Post Creation** - Share text and image posts
- **Comment System** - Engage with posts through comments
- **Like System** - Like/unlike posts with persistent state
- **User Profiles** - View other users' profiles and posts
- **Real-time Updates** - Instant UI updates for all interactions

### Technical Features
- **Cloudinary Integration** - Professional image hosting
- **Toast Notifications** - User-friendly feedback system
- **Responsive Design** - Mobile-first approach
- **Professional Animations** - Smooth transitions and micro-interactions
- **Modern UI/UX** - Gradient designs and glass morphism effects

## 🏗️ Architecture

### Frontend (React)
```
src/
├── components/
│   ├── CreatePost/          # Post creation component
│   ├── ShowPost/           # Home feed display
│   ├── Navbar/              # Navigation bar
│   └── Login/               # Authentication modal
├── pages/
│   ├── Home/                # Main feed page
│   ├── Profile/             # User profile management
│   ├── OtherProfile/         # Other user profiles
│   └── Comment/             # Post discussion page
├── context/
│   └── AppContext.js        # Global state management
└── main.jsx                # Application entry point
```

### Backend (Node.js + Express)
```
backend/
├── models/
│   ├── User.js              # User schema and model
│   ├── Post.js              # Post schema and model
│   └── Comment.js           # Comment schema and model
├── routes/
│   ├── User.js              # User-related endpoints
│   ├── Post.js              # Post-related endpoints
│   └── Comment.js           # Comment-related endpoints
├── middleware/
│   └── auth.js              # Authentication middleware
└── index.js                # Server configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB instance
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Taskplanet
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

3. **Environment Setup**
Create `.env` file in backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/taskplanet
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

4. **Start the application**
```bash
# Backend (Terminal 1)
cd backend
npm start

# Frontend (Terminal 2)
cd frontend
npm start
```

## 📱 API Endpoints

### Authentication
- `POST /user/signup` - Create new user
- `POST /user/login` - Authenticate user

### User Management
- `GET /user/profile` - Get current user profile
- `PUT /user/profile` - Update user profile
- `GET /user/user/:id` - Get other user profile
- `GET /user/posts` - Get current user's posts
- `DELETE /user/post/:id` - Delete user post

### Posts
- `GET /posts` - Get all posts (feed)
- `POST /posts` - Create new post
- `POST /post/:id/like` - Like/unlike post
- `GET /post/:id` - Get single post

### Comments
- `POST /comments` - Create new comment
- `DELETE /comment/:id` - Delete comment
- `GET /comments/post/:postId` - Get post comments

## 🎨 Component Breakdown

### CreatePost Component
- **Purpose**: Create and share new posts
- **Features**: 
  - Text input with character limit
  - Image upload via Cloudinary
  - Real-time preview
  - Professional animations
- **File**: `src/components/CreatePost/CreatePost.jsx`

### ShowPost Component
- **Purpose**: Display main feed of all posts
- **Features**:
  - Infinite scroll capability
  - Like/comment interactions
  - Profile navigation
  - Responsive grid layout
- **File**: `src/components/ShowPost/ShowPost.jsx`

### Profile Component
- **Purpose**: Manage user profile and view posts
- **Features**:
  - Profile editing with image upload
  - Post management (delete)
  - Statistics display
  - Professional animations
- **File**: `src/pages/Profile/Profile.jsx`

### Comment Component
- **Purpose**: Post discussion and comment management
- **Features**:
  - Nested comment display
  - Real-time comment posting
  - Delete own comments
  - Professional UI
- **File**: `src/pages/Comment/Comment.jsx`

### OtherProfile Component
- **Purpose**: View other users' profiles and posts
- **Features**:
  - User information display
  - Post grid with interactions
  - Navigation to user profiles
  - Responsive design
- **File**: `src/pages/OtherProfile/OtherProfile.jsx`

## 🔐 Authentication Flow

1. **Login Modal**: Appears on app load if not authenticated
2. **Token Storage**: JWT tokens stored in localStorage
3. **Protected Routes**: All main features require authentication
4. **Auto-logout**: Handles expired tokens gracefully

## 📸 Image Upload System

### Cloudinary Integration
- **Preset**: `TaskPlanet`
- **Max Size**: 10MB per image
- **Supported Formats**: JPG, PNG, GIF, WebP
- **Storage**: Cloud-based with CDN delivery

### Upload Process
1. User selects image via file input
2. Image preview displayed locally
3. Upload to Cloudinary on confirmation
4. URL returned and stored in database
5. Image displayed with optimized loading

## 🎯 State Management

### AppContext
Global state management using React Context:
```javascript
{
  user: null | object,        // Current authenticated user
  posts: array,               // All posts for feed
  loading: boolean,           // Global loading state
  error: string | null        // Global error state
}
```

### Local State
Each component manages its own state:
- Form inputs and validation
- UI states (loading, error)
- Temporary data (previews, selections)

## 🔄 Real-time Features

### Like System
- **Instant Updates**: Like count updates immediately
- **Persistent State**: Like status maintained across refreshes
- **Optimistic UI**: Updates UI before server confirmation
- **Error Handling**: Graceful fallback on network issues

### Comment System
- **Real-time Addition**: New comments appear instantly
- **Author Identification**: Clear distinction between own/others' comments
- **Delete Permissions**: Only comment authors can delete
- **Timestamp Formatting**: Relative time display

## 🎨 Design System

### Color Palette
- **Primary**: Gradient (#FF8900 to #1877f2)
- **Secondary**: Gradient (#667eea to #764ba2)
- **Success**: #4CAF50
- **Danger**: #ff4757
- **Neutral**: #f8f9fa, #e9ecef

### Animation Library
- **fadeIn**: Smooth entrance animations
- **slideInUp**: Content appearance from bottom
- **shimmer**: Loading and border effects
- **bounce**: Icon animations
- **pulse**: Online indicators

### Responsive Breakpoints
- **Desktop**: > 768px
- **Tablet**: 768px - 480px
- **Mobile**: < 480px

## 🛠️ Development Workflow

### Component Development
1. Create component in appropriate directory
2. Implement functionality with hooks
3. Add responsive CSS with mobile-first approach
4. Test across all screen sizes
5. Add animations and micro-interactions

### Styling Approach
- **CSS Modules**: Scoped styling for components
- **Responsive Design**: Mobile-first media queries
- **Animations**: CSS keyframes for smooth effects
- **Gradients**: Modern gradient backgrounds
- **Glass Morphism**: Backdrop blur effects

## 🔧 Configuration

### Backend Configuration
- **Port**: 5000
- **CORS**: Enabled for frontend
- **Body Parser**: 10MB limit for uploads
- **File Upload**: Multer with memory storage

### Frontend Configuration
- **Development Server**: Port 3000
- **Proxy**: Backend requests proxied
- **Build Tool**: Vite
- **Browser Support**: Modern browsers (ES6+)

## 📊 Database Schema

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  profileImage: String (Cloudinary URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Post Model
```javascript
{
  text: String,
  image: String (Cloudinary URL),
  author: {
    userId: ObjectId (ref: User),
    username: String
  },
  likes: [ObjectId] (ref: User),
  comments: [ObjectId] (ref: Comment),
  createdAt: Date,
  updatedAt: Date
}
```

### Comment Model
```javascript
{
  text: String (required),
  postId: ObjectId (ref: Post),
  userId: ObjectId (ref: User),
  username: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

### Environment Variables
- `NODE_ENV=production`
- `MONGODB_URI=production-database-url`
- `JWT_SECRET=production-secret`

## 🐛 Troubleshooting

### Common Issues
1. **CORS Errors**: Check backend CORS configuration
2. **Image Upload Failures**: Verify Cloudinary credentials
3. **Authentication Issues**: Clear localStorage and re-login
4. **Database Connection**: Ensure MongoDB is running
5. **Build Errors**: Check all dependencies are installed

### Debug Mode
Enable detailed logging:
```bash
# Backend
DEBUG=app:* npm start

# Frontend
console.log() statements throughout components
```

## 🤝 Contributing

### Code Style
- Use ES6+ features
- Follow React best practices
- Implement responsive design
- Add proper error handling
- Include loading states

### Git Workflow
1. Create feature branch
2. Implement changes with tests
3. Submit pull request
4. Code review and merge

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- React.js for the frontend framework
- Node.js/Express for the backend
- MongoDB for the database
- Cloudinary for image hosting
- React Router for navigation
- React Toastify for notifications
- CSS3 for animations and styling

---

**Built with ❤️ using modern web technologies**
