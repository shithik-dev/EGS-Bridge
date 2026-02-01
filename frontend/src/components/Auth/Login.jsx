import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaUserGraduate, FaUserTie } from 'react-icons/fa'

const Login = () => {
  const [role, setRole] = useState('student')
  const [credentials, setCredentials] = useState({
    registerNumber: '',
    password: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const data = role === 'student' 
      ? { registerNumber: credentials.registerNumber, password: credentials.password }
      : { email: credentials.email, password: credentials.password }
    
    const result = await login(data, role)
    setLoading(false)
    
    if (result.success) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-xl w-20 h-20 flex items-center justify-center mb-6 transform hover:scale-105 transition-transform duration-300">
            <FaUserGraduate className="text-3xl text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-lg">Sign in to your EGS Bridge account</p>
        </div>
        
        <div className="glass-effect bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h2>
            <p className="text-gray-500">Choose your account type</p>
          </div>

          <div className="flex mb-8 bg-gray-100 rounded-2xl p-1 shadow-inner">
            <button
              className={`flex-1 py-4 px-6 text-center font-semibold rounded-xl transition-all duration-300 ${
                role === 'student'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
              }`}
              onClick={() => setRole('student')}
            >
              <FaUserGraduate className="inline-block mr-2" />
              Student
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-semibold rounded-xl transition-all duration-300 ${
                role === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
              }`}
              onClick={() => setRole('admin')}
            >
              <FaUserTie className="inline-block mr-2" />
              Placement Officer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {role === 'student' ? (
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Register Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={credentials.registerNumber}
                    onChange={(e) => setCredentials({...credentials, registerNumber: e.target.value})}
                    className="w-full px-5 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 pl-12 shadow-sm hover:shadow-md"
                    placeholder="Enter your register number"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaUserGraduate />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                    className="w-full px-5 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 pl-12 shadow-sm hover:shadow-md"
                    placeholder="Enter your email"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FaUserTie />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full px-5 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 pl-12 shadow-sm hover:shadow-md"
                  placeholder="Enter your password"
                  required
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔒
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-2xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {role === 'student' && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold underline transition-colors duration-300">
                  Register here
                </Link>
              </p>
            </div>
          )}


        </div>
      </div>
    </div>
  )
}

export default Login