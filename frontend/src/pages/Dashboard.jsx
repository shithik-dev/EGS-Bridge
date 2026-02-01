import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiService } from '../services/api'
import { toast } from 'react-hot-toast'
import { 
  FaBell, 
  FaCalendarCheck, 
  FaUserGraduate, 
  FaBuilding,
  FaChartLine,
  FaClipboardList
} from 'react-icons/fa'
import { format } from 'date-fns'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      if (user?.role === 'placement_officer') {
        const [statsRes, eventsRes] = await Promise.allSettled([
          apiService.getJobStatistics(),
          apiService.getJobs()
        ]);
        
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data.data);
        } else {
          console.error('Failed to load statistics:', statsRes.reason);
        }
        
        if (eventsRes.status === 'fulfilled') {
          setUpcomingEvents(eventsRes.value.data.data?.slice(0, 5) || []);
        } else {
          console.error('Failed to load events:', eventsRes.reason);
        }
      } else {
        const [eventsRes, notificationsRes] = await Promise.allSettled([
          apiService.getJobs(),
          apiService.getNotifications()
        ]);
        
        if (eventsRes.status === 'fulfilled') {
          setUpcomingEvents(eventsRes.value.data.data?.slice(0, 5) || []);
        } else {
          console.error('Failed to load events:', eventsRes.reason);
        }
        
        if (notificationsRes.status === 'fulfilled') {
          setNotifications(notificationsRes.value.data.data?.slice(0, 5) || []);
        } else {
          console.error('Failed to load notifications:', notificationsRes.reason);
        }
      }
    } catch (error) {
      console.error('Unexpected error in fetchDashboardData:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (eventId) => {
    try {
      await apiService.registerForJob(eventId)
      toast.success('Successfully registered for the drive!')
      fetchDashboardData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed')
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId)
      setNotifications(notifications.filter(n => n._id !== notificationId))
    } catch (error) {
      console.error('Failed to mark notification as read')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-3xl p-8 shadow-2xl transform hover:scale-[1.01] transition-transform duration-500">
        <div className="absolute inset-0 bg-black bg-opacity-10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-indigo-100 text-sm font-medium">Welcome back!</span>
              </div>
              <h1 className="text-4xl font-bold mb-3">
                Hello, {user.name} 👋
              </h1>
              <p className="text-indigo-100 text-lg max-w-2xl">
                {user.role === 'student' 
                  ? 'Never miss a placement opportunity again. Check your upcoming drives below.'
                  : 'Manage placement drives and help students find their dream jobs.'}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FaUserGraduate className="text-4xl" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-white border-opacity-20">
            <div className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-xl backdrop-blur-sm">
              <FaUserGraduate className="mr-3 text-xl" />
              <div>
                <div className="text-sm text-indigo-100">Department</div>
                <div className="font-bold">{user.department}</div>
              </div>
            </div>
            
            {user.role === 'student' && user.cgpa && (
              <div className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-xl backdrop-blur-sm">
                <div className="mr-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                  {user.cgpa}
                </div>
                <div>
                  <div className="text-sm text-indigo-100">Current CGPA</div>
                  <div className="font-bold">Excellent Performance</div>
                </div>
              </div>
            )}
            
            <div className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-xl backdrop-blur-sm">
              <div className="mr-3 w-8 h-8 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">✓</span>
              </div>
              <div>
                <div className="text-sm text-indigo-100">Account Status</div>
                <div className="font-bold">Verified</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-float"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-white bg-opacity-5 rounded-full animate-ping"></div>
      </div>

      {user.role === 'placement_officer' ? (
        /* Placement Officer Dashboard */
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Drives</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stats.totalEvents || 0}</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-3/4 animate-pulse"></div>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaCalendarCheck className="text-2xl" />
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white to-green-50 p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Active Drives</p>
                  <p className="text-4xl font-bold text-green-600">{stats.activeEvents || 0}</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full w-2/3 animate-pulse"></div>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaClipboardList className="text-2xl" />
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Total Students</p>
                  <p className="text-4xl font-bold text-blue-600">{stats.totalStudents || 0}</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-4/5 animate-pulse"></div>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaUserGraduate className="text-2xl" />
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white to-purple-50 p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Placement Rate</p>
                  <p className="text-4xl font-bold text-purple-600">{stats.placementRate || 0}%</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{width: `${stats.placementRate || 0}%`}}></div>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaChartLine className="text-2xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Recently Placed Students */}
          {stats.recentlyPlaced && stats.recentlyPlaced.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recently Placed Students</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Student Name</th>
                      <th className="text-left py-3 px-4">Company</th>
                      <th className="text-left py-3 px-4">Package (LPA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentlyPlaced.map((student, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{student.name}</td>
                        <td className="py-3 px-4">
                          <span className="flex items-center">
                            <FaBuilding className="mr-2 text-gray-500" />
                            {student.placedCompany}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-green-600">
                          ₹{student.placedPackage}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upcoming Drives */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Drives</h2>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <h3 className="font-semibold text-gray-800">{event.companyName}</h3>
                      <p className="text-gray-600 text-sm">{event.jobTitle}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <FaCalendarCheck className="mr-1" />
                        <span>Drive: {format(new Date(event.driveDate), 'MMM dd, yyyy')}</span>
                        <span className="mx-2">•</span>
                        <span>Deadline: {format(new Date(event.registrationDeadline), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      event.status === 'Active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming drives scheduled</p>
            )}
          </div>
        </>
      ) : (
        /* Student Dashboard */
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg mr-4 group-hover:scale-110 transition-transform duration-300">
                  <FaBell className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Unread Notifications</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {notifications.filter(n => !n.isRead).length}
                  </p>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse" style={{width: `${Math.min(notifications.filter(n => !n.isRead).length * 20, 100)}%`}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white to-green-50 p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg mr-4 group-hover:scale-110 transition-transform duration-300">
                  <FaCalendarCheck className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Upcoming Drives</p>
                  <p className="text-3xl font-bold text-gray-800">{upcomingEvents.length}</p>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse" style={{width: `${Math.min(upcomingEvents.length * 25, 100)}%`}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white to-purple-50 p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg mr-4 group-hover:scale-110 transition-transform duration-300">
                  <FaBuilding className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Registered Drives</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {upcomingEvents.filter(e => e.isRegistered).length}
                  </p>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{width: `${Math.min((upcomingEvents.filter(e => e.isRegistered).length / Math.max(upcomingEvents.length, 1)) * 100, 100)}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Recent Notifications</h2>
              <a href="/notifications" className="text-primary-600 hover:text-primary-700 font-medium">
                View All
              </a>
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    className={`p-4 rounded-lg border ${notification.isRead ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}
                    onClick={() => markNotificationAsRead(notification._id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-gray-400 text-sm mt-2">
                          {format(new Date(notification.createdAt), 'MMM dd, yyyy hh:mm a')}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No notifications yet</p>
            )}
          </div>

          {/* Upcoming Drives */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upcoming Drives</h2>
              <a href="/jobs" className="text-primary-600 hover:text-primary-700 font-medium">
                View All
              </a>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{event.companyName}</h3>
                      <p className="text-gray-600 text-sm">{event.jobTitle}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <FaCalendarCheck className="mr-1" />
                        <span>Drive: {format(new Date(event.driveDate), 'MMM dd, yyyy')}</span>
                        <span className="mx-2">•</span>
                        <span>Deadline: {format(new Date(event.registrationDeadline), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {event.isRegistered ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          Registered
                        </span>
                      ) : event.canRegister ? (
                        <button
                          onClick={() => handleRegister(event._id)}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Register
                        </button>
                      ) : (
                        <span className="text-red-600 text-sm">Not Eligible</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming drives available</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard