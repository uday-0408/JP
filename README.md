# Job Portal System with AI-Powered Resume Matching

![Project Banner](https://img.shields.io/badge/Job%20Portal-AI%20Powered-blue)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![Django](https://img.shields.io/badge/API-Django-red)
![Groq](https://img.shields.io/badge/AI-Groq%20LLM-purple)

A comprehensive job portal application with AI-powered resume-job matching that connects job seekers with recruiters. This system combines a MERN stack web application with a Django-based AI service for intelligent job matching.

## 📌 Table of Contents

- [System Architecture](#-system-architecture)
- [Features Overview](#-features-overview)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Flow Diagrams](#-flow-diagrams)
- [Setup Instructions](#-setup-instructions)
- [API Documentation](#-api-documentation)
- [Integration Points](#-integration-points)
- [User Guides](#-user-guides)
- [Development & Contribution](#-development--contribution)

## 🏗 System Architecture

The project consists of three main components:

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                 │     │                  │     │                  │
│  React Frontend │────▶│  Node.js Backend │────▶│  Django AI API   │
│                 │◀────│                  │◀────│                  │
└─────────────────┘     └──────────────────┘     └──────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    User UI      │     │    MongoDB       │     │ Groq LLM API &   │
│    (Browser)    │     │    Database      │     │  SQLite DB       │
└─────────────────┘     └──────────────────┘     └──────────────────┘
```

### System Components:

1. **Frontend (React)**: User interface for job seekers and recruiters
2. **Backend (Node.js/Express)**: Core business logic and MongoDB database operations
3. **AI Service (Django)**: AI-powered resume processing and job matching using Groq LLM API

### Data Flow:

- Frontend communicates with Node.js backend for job listings, user authentication, and application management
- Backend communicates with Django AI service for resume processing and job matching
- Django AI service uses Groq LLM API to perform intelligent resume-to-job matching

## 🌟 Features Overview

### For Job Seekers:

- **Account Management**: Registration, profile creation and update (including profile picture)
- **Job Discovery**: Browse, search, and filter jobs with advanced filtering options
- **Resume Management**: Upload and manage resumes with AI-powered job matching
- **Application Tracking**: Track application status and history
- **Bookmarking**: Save jobs for later viewing
- **AI Matching**: Get personalized job matches based on resume analysis

### For Recruiters:

- **Company Management**: Create and manage company profiles
- **Job Posting**: Create detailed job listings
- **Applicant Management**: Review and manage job applications
- **Candidate Evaluation**: AI-assisted candidate compatibility scoring
- **Analytics Dashboard**: Track job performance and applicant metrics

### AI Features:

- **Resume Analysis**: Extract skills, experience, and qualifications from PDF resumes
- **Job Compatibility**: Calculate job-resume compatibility scores
- **Job Data Extraction**: Extract structured data from unstructured job descriptions
- **Skill Matching**: Match candidate skills with job requirements

## 🛠 Technology Stack

### Frontend (React)
- React.js with Vite build tool
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS & Shadcn UI for styling
- Axios for API communication
- Framer Motion for animations

### Backend (Node.js)
- Express.js web framework
- MongoDB database with Mongoose ODM
- JWT authentication
- Cloudinary for file storage
- Multer for file uploads
- RESTful API architecture

### AI Service (Django)
- Django web framework
- Django REST Framework for API
- pdfplumber for PDF text extraction
- Groq LLM API integration
- SQLite database for resume and job storage

## 📁 Project Structure

```
JP/
├── Job_portal/               # MERN Stack Application
│   ├── frontend/            # React Frontend
│   │   ├── src/             # Source code
│   │   │   ├── components/  # React components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── redux/       # Redux store and slices
│   │   │   └── utils/       # Utility functions
│   │   └── public/          # Static assets
│   │
│   ├── backend/             # Node.js Backend
│   │   ├── controllers/     # Route controllers
│   │   ├── middlewares/     # Express middlewares
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   │
│   └── package.json         # Project dependencies
│
├── jobapi/                  # Django AI Service
│   ├── jobs/                # Main Django app
│   │   ├── models.py        # Database models
│   │   ├── views.py         # View functions
│   │   └── urls.py          # URL routing
│   │
│   ├── resumes/             # Uploaded resume storage
│   ├── templates/           # HTML templates
│   └── manage.py            # Django management script
│
└── README.md                # Project documentation
```

## 📊 Flow Diagrams

### User Registration & Authentication Flow

```
┌──────────┐     ┌───────────────┐     ┌─────────────┐     ┌──────────────┐
│          │     │               │     │             │     │              │
│  User    │────▶│  Sign Up Form │────▶│  Validate   │────▶│  Create User │
│          │     │               │     │  Data       │     │  in MongoDB  │
└──────────┘     └───────────────┘     └─────────────┘     └──────────────┘
                                                                  │
                                                                  ▼
┌──────────┐     ┌───────────────┐     ┌─────────────┐     ┌──────────────┐
│          │     │               │     │             │     │              │
│  User    │◀────│  Login Access │◀────│  Issue JWT  │◀────│  Success     │
│          │     │               │     │  Token      │     │  Response    │
└──────────┘     └───────────────┘     └─────────────┘     └──────────────┘
```

### Resume-Job Matching Flow

```
┌──────────┐     ┌───────────────┐     ┌─────────────────────┐
│          │     │               │     │                     │
│  User    │────▶│  Upload       │────▶│  Node.js Backend    │
│          │     │  Resume       │     │  (Store Reference)  │
└──────────┘     └───────────────┘     └─────────────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌───────────────┐     ┌─────────────────────┐
│              │     │               │     │                     │
│  Display     │◀────│  Process      │◀────│  Django AI Service  │
│  Results     │     │  Results      │     │  (Groq LLM)         │
└──────────────┘     └───────────────┘     └─────────────────────┘
```

### Job Application Flow

```
┌──────────┐     ┌───────────────┐     ┌─────────────────────┐
│          │     │               │     │                     │
│  User    │────▶│  View Job     │────▶│  Submit Application │
│          │     │  Details      │     │                     │
└──────────┘     └───────────────┘     └─────────────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌───────────────┐     ┌─────────────────────┐
│              │     │               │     │                     │
│  Track       │◀────│  Update       │◀────│  Notify Recruiter   │
│  Status      │     │  Status       │     │                     │
└──────────────┘     └───────────────┘     └─────────────────────┘
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Python (v3.10+)
- Git

### Setting Up the MERN Application

1. **Clone the repository**
   ```bash
   git clone https://github.com/uday-0408/JP.git
   cd JP
   ```

2. **Set up the Node.js backend**
   ```bash
   cd Job_portal/backend
   npm install
   ```

   Create a `.env` file with the following variables:
   ```
   MONGO_URI=your_mongodb_uri
   SECRET_KEY=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   PORT=8000
   DJANGO_END_POINT=http://localhost:5000/api
   ```

3. **Set up the React frontend**
   ```bash
   cd ../frontend
   npm install
   ```

   Create a `.env` file with:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start the MERN application**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm run dev
   ```

### Setting Up the Django AI Service

1. **Set up Python environment**
   ```bash
   cd ../../jobapi
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create a `.env` file**
   ```
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the Django server**
   ```bash
   python manage.py runserver 5000
   ```

## 📘 API Documentation

### Node.js Backend API Endpoints

#### Authentication
- `POST /api/user/register` - Register a new user
- `POST /api/user/login` - User login
- `POST /api/user/logout` - User logout
- `GET /api/user/auto-login` - Auto login with token

#### User Profile
- `POST /api/user/profile/update` - Update user profile

#### Jobs
- `POST /api/job/post` - Create a new job listing
- `GET /api/job/get` - Get all jobs
- `GET /api/job/get/:id` - Get job by ID
- `GET /api/job/getadminjobs` - Get jobs for admin
- `GET /api/job/django-jobs` - Get jobs from Django API
- `POST /api/job/extract-job-data/:jobId` - Extract structured data from job description

#### Applications
- `GET /api/application/apply/:jobId` - Apply for a job
- `GET /api/application/my-applications` - Get user's applications
- `POST /api/application/update-status` - Update application status

#### Companies
- `POST /api/company/create` - Create a company
- `GET /api/company/get` - Get all companies
- `GET /api/company/get/:id` - Get company by ID

#### Bookmarks
- `GET /api/bookmark/add/:jobId` - Bookmark a job
- `GET /api/bookmark/remove/:jobId` - Remove bookmark
- `GET /api/bookmark/get` - Get user's bookmarks

### Django AI Service API Endpoints

- `POST /api/upload_resume/` - Upload a resume file
- `POST /api/find_jobs/` - Find compatible jobs for a resume
- `GET /api/find_jobs_page/` - Frontend page for job matching
- `GET /api/paginated_jobs/` - Get paginated job listings
- `POST /api/match_resume_job/` - Match specific resume to job
- `POST /api/extract_job_data/` - Extract structured data from job description

## 🔄 Integration Points

### Frontend-Backend Integration
- React components make HTTP requests to Node.js API endpoints using Axios
- Redux manages client-side state and synchronizes with the backend
- JWT authentication tokens stored in cookies

### Node.js-Django Integration
- Node.js backend forwards resume files to Django service
- Django processes resumes and returns structured data
- Job compatibility calculations performed via Django endpoint
- Job data extraction performed by Django with Groq LLM

### File Storage Integration
- User profile pictures stored in Cloudinary via Node.js
- Resume files stored in Django's file system
- Job information stored in MongoDB
- Extracted job data synchronized between MongoDB and Django SQLite

## 📚 User Guides

### For Job Seekers

1. **Registration & Profile Setup**
   - Sign up with your details
   - Complete your profile with skills, bio, and profile picture
   - Upload your resume for job matching

2. **Finding Jobs**
   - Browse jobs on the Jobs page
   - Use filters to narrow down results
   - Check AI-recommended jobs based on your resume
   
3. **Applying for Jobs**
   - View job details
   - Click "Apply" button to submit application
   - Check application status in your profile

4. **Managing Applications**
   - Track all your applications
   - View status updates
   - Bookmark interesting jobs for later

### For Recruiters

1. **Company Setup**
   - Create your company profile
   - Add company details and logo

2. **Posting Jobs**
   - Create detailed job listings
   - Set requirements, salary range, etc.

3. **Managing Applicants**
   - View all applications for your jobs
   - Check applicant compatibility scores
   - Update application statuses
   
4. **Using AI Features**
   - Extract structured data from job descriptions
   - Match resumes to jobs automatically

## 👨‍💻 Development & Contribution

### Development Environment Setup

1. Follow the setup instructions above
2. Use VSCode for best development experience
3. Install recommended extensions for React and Node.js development

### Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make changes to relevant components
3. Test thoroughly
4. Submit pull request

### Code Style Guidelines

- Use ESLint and Prettier for JavaScript/React code
- Follow PEP 8 style guide for Python code
- Use descriptive variable and function names
- Add comments for complex logic

## 🤝 Contributors

- [Your Team Members]

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
