import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaHome, 
  FaTachometerAlt, 
  FaBriefcase, 
  FaBell, 
  FaUserGraduate,
  FaUsers,
  FaChartBar,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const studentMenuItems = [
    { to: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { to: '/jobs', icon: <FaBriefcase />, label: 'Placement Drives' },
    { to: '/notifications', icon: <FaBell />, label: 'Notifications' },
    { to: '/profile', icon: <FaUserGraduate />, label: 'Profile' },
  ];

  const adminMenuItems = [
    { to: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { to: '/admin/jobs', icon: <FaBriefcase />, label: 'Manage Drives' },
    { to: '/admin/students', icon: <FaUsers />, label: 'Students' },
    { to: '/admin/notifications', icon: <FaBell />, label: 'Notifications' },
    { to: '/admin/analytics', icon: <FaChartBar />, label: 'Analytics' },
    { to: '/admin/settings', icon: <FaCog />, label: 'Settings' },
  ];

  const menuItems = user?.role === 'placement_officer' ? adminMenuItems : studentMenuItems;

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 md:w-64 shrink-0`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <FaBriefcase className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">EGS Bridge</h2>
                <p className="text-xs text-gray-500">
                  {user?.role === 'placement_officer' ? 'Admin Panel' : 'Student Portal'}
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <FaUserGraduate className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.department}
                  {user?.role === 'student' && user?.cgpa && ` • CGPA: ${user.cgpa}`}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FaSignOutAlt className="mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;