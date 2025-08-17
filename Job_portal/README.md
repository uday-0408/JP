# Job Connect - Full Stack Job Portal 💼

A comprehensive job portal application built with the MERN stack that connects job seekers with recruiters. Features role-based authentication, company management, job posting, and application tracking.

![React](https://img.shields.io/badge/React-19.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)
![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey)

## 🌟 Features

### For Job Seekers (Students)

- 🔍 Browse and search job opportunities with keyword filtering
- 📄 One-click job applications with status tracking
- 📊 Comprehensive application history and status monitoring
- 👤 Complete profile management with resume upload (PDF)
- 🎯 Skills showcase with customizable badges
- 📱 Responsive design optimized for all devices

### For Recruiters (Admin)

- 🏢 Complete company registration and profile management
- 📝 Post and manage job openings with detailed requirements
- 👥 View and manage job applicants with advanced filtering
- 📈 Application status management (pending, accepted, rejected)
- 🖼️ Company branding with logo upload and customization
- 📊 Admin dashboard for comprehensive job and applicant tracking

### Security & Performance

- 🔐 JWT-based authentication with secure cookie management
- 🛡️ Role-based access control (Student/Recruiter)
- ☁️ Cloudinary integration for file storage and management
- 🚀 Redux Toolkit for efficient state management
- 🎨 Modern UI with Shadcn/UI and Tailwind CSS
- 🔔 Real-time toast notifications with Sonner

## 🛠️ Tech Stack

### Frontend

- **React.js 19** - Latest React with Vite build tool
- **Redux Toolkit** - State management with Redux Persist
- **React Router v7** - Client-side routing and navigation
- **Tailwind CSS v4** - Utility-first CSS framework
- **Shadcn/UI** - Modern, accessible UI components
- **Radix UI** - Headless UI primitives
- **Axios** - Promise-based HTTP client
- **Sonner** - Beautiful toast notifications
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful SVG icons

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast web framework
- **MongoDB** - NoSQL database
- **Mongoose** - Elegant MongoDB ODM
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing library
- **Multer** - Multipart form data handling
- **Cloudinary** - Cloud-based image and video storage
- **Cookie Parser** - Cookie parsing middleware
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn package manager

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/job-connect.git
cd job-connect
```

2. **Install root dependencies**

```bash
npm install
```

3. **Install backend dependencies**

```bash
cd backend
npm install
```

4. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

5. **Environment Setup**

Create `.env` file in the backend directory:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/jobconnect

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server Configuration
PORT=8000
NODE_ENV=development
```

Create `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

6. **Start the application**

**Option 1: Run both servers simultaneously**

```bash
# From root directory
npm start
```

**Option 2: Run servers separately**

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

7. **Access the application**

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- MongoDB: mongodb://localhost:27017

## 📁 Project Structure

```
job-connect/
├── package.json                    # Root package with concurrently scripts
├── README.md                       # Project documentation
├── backend/
│   ├── controllers/               # Route controllers
│   │   ├── application.controller.js
│   │   ├── company.controller.js
│   │   ├── job.controller.js
│   │   └── user.controller.js
│   ├── middlewares/               # Custom middleware
│   │   ├── isAuthenticated.js
│   │   └── multer.js
│   ├── models/                    # Mongoose models
│   │   ├── application.model.js
│   │   ├── company.model.js
│   │   ├── job.model.js
│   │   └── user.model.js
│   ├── routes/                    # API routes
│   ├── utils/                     # Utility functions
│   ├── .env                       # Environment variables
│   ├── index.js                   # Server entry point
│   └── package.json               # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── admin/             # Admin/Recruiter components
│   │   │   │   ├── ApplicantsTable.jsx
│   │   │   │   ├── CompanyCreate.jsx
│   │   │   │   ├── CompanySetup.jsx
│   │   │   │   └── PostJob.jsx
│   │   │   ├── auth/              # Authentication components
│   │   │   ├── shared/            # Shared components
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── ui/                # UI components (Shadcn)
│   │   │   │   ├── button.jsx
│   │   │   │   ├── input.jsx
│   │   │   │   ├── dialog.jsx
│   │   │   │   └── ...
│   │   │   ├── Home.jsx
│   │   │   ├── Job.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── UpdateProfileDialog.jsx
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useGetAllJobs.jsx
│   │   │   ├── useGetCompanyById.jsx
│   │   │   └── ...
│   │   ├── redux/                 # State management
│   │   │   ├── authSlice.js
│   │   │   ├── companySlice.js
│   │   │   ├── jobSlice.js
│   │   │   └── store.js
│   │   ├── utils/                 # Utility functions
│   │   ├── lib/                   # Library configurations
│   │   ├── App.jsx                # Main App component
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Global styles
│   ├── public/                    # Static assets
│   ├── components.json            # Shadcn configuration
│   ├── vite.config.js             # Vite configuration
│   └── package.json               # Frontend dependencies
```

## 🔗 API Endpoints

### Authentication & User Management

- `POST /api/v1/user/register` - User registration with file upload
- `POST /api/v1/user/login` - User authentication
- `POST /api/v1/user/logout` - User logout
- `PUT /api/v1/user/profile/update` - Update user profile with resume

### Company Management

- `POST /api/v1/company/register` - Register new company
- `GET /api/v1/company/get` - Get user's companies
- `GET /api/v1/company/get/:id` - Get company by ID
- `PUT /api/v1/company/update/:id` - Update company with logo upload

### Job Management

- `POST /api/v1/job/post` - Post new job opportunity
- `GET /api/v1/job/get` - Get all jobs with keyword search
- `GET /api/v1/job/get/:id` - Get specific job details
- `GET /api/v1/job/getadminjobs` - Get recruiter's posted jobs

### Application Management

- `POST /api/v1/application/apply/:id` - Apply to specific job
- `GET /api/v1/application/get` - Get user's applications
- `GET /api/v1/application/:id/applicants` - Get job applicants
- `POST /api/v1/application/status/:id/update` - Update application status

## 🎯 Database Models

### User Model

```javascript
{
  fullname: String,
  email: String (unique),
  phoneNumber: Number,
  password: String (hashed),
  role: ["student", "recruiter"],
  profile: {
    bio: String,
    skills: [String],
    resume: String (Cloudinary URL),
    resumeOriginalName: String,
    company: ObjectId (ref: Company),
    profilePhoto: String (Cloudinary URL)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Company Model

```javascript
{
  name: String (required),
  description: String,
  website: String,
  location: String,
  logo: String (Cloudinary URL),
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Job Model

```javascript
{
  title: String (required),
  description: String (required),
  requirements: [String],
  salary: Number,
  experienceLevel: Number,
  location: String,
  jobType: String,
  position: Number,
  company: ObjectId (ref: Company),
  created_by: ObjectId (ref: User),
  applications: [ObjectId] (ref: Application),
  createdAt: Date,
  updatedAt: Date
}
```

### Application Model

```javascript
{
  job: ObjectId (ref: Job),
  applicant: ObjectId (ref: User),
  status: ["pending", "accepted", "rejected"],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Available Scripts

### Root Level

- `npm start` - Run both frontend and backend concurrently
- `npm run server` - Run backend only
- `npm run client` - Run frontend only

### Backend Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Frontend Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 UI Components & Styling

### Component Library

- **Shadcn/UI** - Modern, accessible components built on Radix UI
- **Tailwind CSS v4** - Utility-first CSS framework
- **Custom variants** - Dark mode support with CSS variables
- **Responsive design** - Mobile-first approach

### Key UI Features

- **Form handling** - Advanced forms with validation
- **File uploads** - Drag & drop file upload components
- **Modals & dialogs** - Accessible dialog components
- **Tables** - Data tables with sorting and filtering
- **Carousels** - Image and content carousels
- **Notifications** - Toast notifications with Sonner

## 🚀 Deployment

### Backend Deployment (Railway/Heroku)

1. Set up environment variables in deployment platform
2. Configure MongoDB Atlas connection
3. Deploy using Git integration

### Frontend Deployment (Vercel/Netlify)

1. Build the project:

```bash
npm run build
```

2. Deploy the `dist` folder
3. Configure environment variables

### Environment Variables for Production

```env
# Backend
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jobconnect
JWT_SECRET=production_jwt_secret
CLOUDINARY_CLOUD_NAME=production_cloud_name
CLOUDINARY_API_KEY=production_api_key
CLOUDINARY_API_SECRET=production_api_secret
NODE_ENV=production

# Frontend
VITE_API_URL=https://your-backend-domain.com/api/v1
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn/UI](https://ui.shadcn.com/) for beautiful, accessible UI components
- [Radix UI](https://www.radix-ui.com/) for headless UI primitives
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Cloudinary](https://cloudinary.com/) for cloud-based media management
- [MongoDB](https://www.mongodb.com/) for flexible document database
- [Vite](https://vitejs.dev/) for fast build tooling

## 📧 Contact

Project Link: [https://github.com/pvtsonicbaka/Job_portal](https://github.com/pvtsonicbaka/Job_portal)

---

⭐ Star this repository if you found it helpful!

## 🔮 Future Enhancements

- 📧 Email notifications for job applications
- 💬 Real-time chat between recruiters and candidates
- 📊 Advanced analytics dashboard
- 🔍 AI-powered job matching
- 📱 Mobile application
- 🌐 Multi-language support
- 💳 Payment integration for premium
