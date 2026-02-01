import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  FaBell,
  FaCalendarCheck,
  FaBuilding,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaUserCheck
} from 'react-icons/fa';
import { format, differenceInDays, isToday } from 'date-fns';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotification();
  const [stats, setStats] = useState({});
  const [upcomingDrives, setUpcomingDrives] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [eventsRes, statsRes, notificationsRes] = await Promise.all([
        axios.get('/api/jobs/events'),
        axios.get('/api/students/statistics'),
        axios.get('/api/notifications?limit=5')
      ]);

      setUpcomingDrives(eventsRes.data.data.slice(0, 5));
      setStats(statsRes.data.data);
      setNotifications(notificationsRes.data.data.notifications || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await axios.post(`/api/jobs/events/${eventId}/register`);
      toast.success('Successfully registered!');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    }
  };

  const getStatusBadge = (event) => {
    const now = new Date();
    const deadline = new Date(event.registrationDeadline);

    if (event.isRegistered) {
      return (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center">
          <FaUserCheck className="mr-1" /> Registered
        </span>
      );
    }

    if (deadline < now) {
      return (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
          Deadline Passed
        </span>
      );
    }

    const daysLeft = differenceInDays(deadline, now);

    if (daysLeft <= 1) {
      return (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
          ⚠️ Today
        </span>
      );
    }

    if (daysLeft <= 3) {
      return (
        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
          {daysLeft} days left
        </span>
      );
    }

    return (
      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
        Open
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-linear-to-r from-primary-500 to-primary-700 text-white rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-primary-100 mb-4">
              {stats.upcomingEvents > 0
                ? `You have ${stats.upcomingEvents} upcoming placement drive${stats.upcomingEvents > 1 ? 's' : ''}`
                : 'No upcoming drives. Check back soon!'}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <FaUserCheck className="mr-2" />
                <span>Registered: {stats.registeredEvents || 0}</span>
              </div>
              <div className="flex items-center">
                <FaBuilding className="mr-2" />
                <span>Total Opportunities: {stats.totalEvents || 0}</span>
              </div>
              {user?.cgpa && (
                <div className="flex items-center">
                  <FaChartLine className="mr-2" />
                  <span>CGPA: {user.cgpa}</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{unreadCount}</div>
                <div className="text-sm opacity-90">Unread Notifications</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Upcoming Drives</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.upcomingEvents || 0}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <FaCalendarCheck className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Registered</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.registeredEvents || 0}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Missed Deadlines</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.missedDeadlines || 0}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today's Drives</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {upcomingDrives.filter(d => isToday(new Date(d.driveDate))).length}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <FaClock className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Drives */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Upcoming Drives</h2>
              <Link
                to="/jobs"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="p-5">
            {upcomingDrives.length > 0 ? (
              <div className="space-y-4">
                {upcomingDrives.map((drive) => (
                  <div
                    key={drive._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {drive.companyName}
                        </h3>
                        {getStatusBadge(drive)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{drive.jobTitle}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <FaCalendarCheck className="mr-1" />
                        <span>
                          Drive: {format(new Date(drive.driveDate), 'MMM dd')} •{' '}
                          Deadline: {format(new Date(drive.registrationDeadline), 'MMM dd')}
                        </span>
                      </div>
                    </div>
                    {!drive.isRegistered && drive.canRegister && (
                      <button
                        onClick={() => handleRegister(drive._id)}
                        className="ml-4 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 whitespace-nowrap"
                      >
                        Register
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaCalendarCheck className="text-gray-300 text-4xl mx-auto mb-3" />
                <p className="text-gray-500">No upcoming drives</p>
                <p className="text-gray-400 text-sm mt-1">
                  Check back later for new opportunities
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Recent Notifications</h2>
              <Link
                to="/notifications"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="p-5">
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 rounded-lg border ${
                      notification.isRead
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg mr-3 ${
                        notification.priority === 'URGENT'
                          ? 'bg-red-100 text-red-600'
                          : notification.priority === 'HIGH'
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        <FaBell />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-800">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1 text-sm">
                          {notification.message}
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          {format(new Date(notification.createdAt), 'MMM dd, hh:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaBell className="text-gray-300 text-4xl mx-auto mb-3" />
                <p className="text-gray-500">No notifications</p>
                <p className="text-gray-400 text-sm mt-1">
                  You're all caught up!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Placement Status */}
      {stats.placementStatus === 'Placed' && (
        <div className="bg-linear-to-r from-green-500 to-green-600 text-white rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <FaCheckCircle className="text-2xl mr-3" />
                <h2 className="text-2xl font-bold">Congratulations! 🎉</h2>
              </div>
              <p className="text-green-100">
                You have been placed at {stats.placedCompany}
                {stats.placedPackage && ` with package ₹${stats.placedPackage} LPA`}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">Placed</div>
                  <div className="text-sm opacity-90">Successfully</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;