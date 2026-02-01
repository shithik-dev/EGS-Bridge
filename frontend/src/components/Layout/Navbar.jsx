import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import NotificationBell from '../Common/NotificationBell';
import { 
  FaHome, 
  FaBriefcase, 
  FaUserGraduate, 
  FaSignOutAlt, 
  FaSignInAlt, 
  FaUserPlus,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLinks = () => (
    <>
      <li>
        <Link 
          to="/" 
          className="flex items-center px-5 py-3 text-gray-700 hover:text-indigo-600 font-medium rounded-xl transition-all duration-300 hover:bg-indigo-50 group"
        >
          <FaHome className="mr-2 group-hover:scale-110 transition-transform" />
          Home
        </Link>
      </li>
      
      {user && (
        <>
          <li>
            <Link 
              to="/dashboard" 
              className="flex items-center px-5 py-3 text-gray-700 hover:text-indigo-600 font-medium rounded-xl transition-all duration-300 hover:bg-indigo-50 group"
            >
              <FaBriefcase className="mr-2 group-hover:scale-110 transition-transform" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/jobs" 
              className="flex items-center px-5 py-3 text-gray-700 hover:text-indigo-600 font-medium rounded-xl transition-all duration-300 hover:bg-indigo-50 group"
            >
              <FaBriefcase className="mr-2 group-hover:scale-110 transition-transform" />
              Placement Drives
            </Link>
          </li>
          {user.role === 'placement_officer' && (
            <li>
              <Link 
                to="/admin/students" 
                className="flex items-center px-5 py-3 text-gray-700 hover:text-indigo-600 font-medium rounded-xl transition-all duration-300 hover:bg-indigo-50 group"
              >
                <FaUserGraduate className="mr-2 group-hover:scale-110 transition-transform" />
                Students
              </Link>
            </li>
          )}
        </>
      )}
    </>
  );

  const AuthButtons = () => (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm">
                <div className="font-semibold text-gray-800">{user.name}</div>
                <div className="text-xs text-gray-500 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  {user.department}
                </div>
              </div>
            </div>
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="flex items-center px-5 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 rounded-xl transition-all duration-300 font-medium shadow-sm hover:shadow-md"
          >
            <FaSignInAlt className="mr-2" />
            Login
          </Link>
          <Link
            to="/register"
            className="hidden md:flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <FaUserPlus className="mr-2" />
            Register
          </Link>
        </>
      )}
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <img 
                    src="/logo.jpg" 
                    alt="EGS Bridge Logo" 
                    className="w-10 h-10 object-contain transition-transform duration-300 group-hover:rotate-6"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
                  EGS Bridge
                </h1>
                <p className="text-xs text-gray-500 font-medium">Connecting talent with opportunities</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <ul className="flex space-x-1">
              <NavLinks />
            </ul>
            <div className="h-6 w-px bg-gray-300"></div>
            <AuthButtons />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            {user && <NotificationBell />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <ul className="space-y-2">
              <NavLinks />
              <li className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="space-y-3">
                    <div className="px-4 py-2 bg-gray-50 rounded-md">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.department}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-md"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block w-full text-center px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaSignInAlt className="inline mr-2" />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full text-center px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FaUserPlus className="inline mr-2" />
                      Register
                    </Link>
                  </div>
                )}
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;