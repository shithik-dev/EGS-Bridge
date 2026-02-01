# EGS Bridge - Engineering Graduate System Bridge

A comprehensive placement management system designed to connect engineering students with dream job opportunities through smart reminders and personalized job matching.

## 🚀 Overview

EGS Bridge is a full-stack web application built to streamline the campus placement process for engineering colleges. The platform serves as a bridge between students and placement opportunities, ensuring no student misses critical placement drives and deadlines.

## ✨ Features

### For Students
- **Personalized Job Matching**: Receive job recommendations based on department, CGPA, and skills
- **Smart Reminders**: Automated email and in-app reminders for upcoming deadlines
- **Centralized Calendar**: All placement drives organized in one place with clear timelines
- **Easy Registration**: One-click registration for placement drives with instant confirmation
- **Real-time Notifications**: Stay updated with relevant placement news and status updates

### For Placement Officers
- **Drive Management**: Create and manage placement drives with ease
- **Student Tracking**: Monitor student registration and placement status
- **Statistics Dashboard**: Comprehensive analytics on placement rates and drive effectiveness
- **Automated Communications**: Send notifications and reminders to eligible students

## 🛠️ Tech Stack

### Frontend
- **React.js** - Component-based UI library
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - Object Data Modeling (ODM) library
- **JWT** - Authentication and authorization
- 

### Additional Tools
- **Cron Jobs** - Automated scheduling for reminders
- **Bcrypt** - Password hashing
- **Dotenv** - Environment variable management

## 🏗️ Architecture

The application follows a modular architecture with:
- **Frontend**: React components organized by features (Authentication, Dashboard, Jobs, etc.)
- **Backend**: Express routes, controllers, models, and middleware
- **Database**: MongoDB collections for Students, Placement Events, Notifications, etc.
- **Services**: Email notifications, reminder scheduling, and authentication

## 📋 Prerequisites

Before running this application, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn package manager
- MongoDB (local installation or cloud Atlas)

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd egs-bridge
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Return to the root directory:
```bash
cd ..
```

## ⚙️ Configuration

### Environment Variables

Create `.env` files in both the `backend` and `frontend` directories:

#### Backend (.env in backend/)
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/egs-bridge

# JWT
JWT_SECRET=your-super-secret-jwt-key



# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000,http://localhost:5173
```

#### Frontend (.env in frontend/)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Development Mode

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Access the application:
   - Frontend: http://localhost:5173 (or assigned port)
   - Backend API: http://localhost:5000/api

### Production Mode

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the backend server (serves both API and static frontend files):
```bash
cd backend
npm start
```

## 🔐 Default Credentials

### Placement Officer Login
- **Email**: placement@gmail.com
- **Password**: placement123

### Admin Access
- **Role-based Access Control**: Different dashboards for students and placement officers
- **Protected Routes**: Sensitive data and functionality restricted by role

## 🗂️ Project Structure

```
egs-bridge/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, email configs
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Authentication, error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API route definitions
│   │   ├── scripts/         # Setup scripts
│   │   └── utils/           # Helper functions
│   ├── .env                 # Environment variables
│   └── server.js            # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # React Context providers
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── .env                 # Environment variables
└── README.md
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register/student` - Register a new student
- `POST /api/auth/login/student` - Student login
- `POST /api/auth/login/admin` - Placement officer login
- `GET /api/auth/profile` - Get user profile

### Jobs/Placement Events
- `GET /api/jobs/events` - Get all placement events
- `POST /api/jobs/events` - Create new placement event (Admin only)
- `PUT /api/jobs/events/:id` - Update placement event (Admin only)
- `DELETE /api/jobs/events/:id` - Delete placement event (Admin only)
- `POST /api/jobs/events/:id/register` - Register for event (Student only)
- `GET /api/jobs/statistics` - Get placement statistics (Admin only)

### Students
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile
- `GET /api/students/registered-events` - Get registered events
- `GET /api/students/placed` - Get placed students
- `POST /api/students/Mark-placed` - Mark student as placed (Admin only)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `POST /api/notifications/create` - Create notification (Admin only)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



---

<div align="center">

Built with ❤️ for engineering students

</div>