import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import Home from './pages/Home'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Notifications from './pages/Notifications'
import JobForm from './components/Jobs/JobForm'

function App() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/jobs" 
            element={user ? <Jobs /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/notifications" 
            element={user ? <Notifications /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/jobs/new" 
            element={user && user.role === 'placement_officer' ? <JobForm /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/jobs/edit/:id" 
            element={user && user.role === 'placement_officer' ? <JobForm /> : <Navigate to="/login" />} 
          />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  )
}

export default App