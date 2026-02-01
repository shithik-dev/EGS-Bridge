import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  FaUsers,
  FaBuilding,
  FaCalendarCheck,
  FaChartLine,
  FaUserCheck,
  FaExclamationCircle,
  FaBell,
  FaPlus
} from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentDrives, setRecentDrives] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, drivesRes, studentsRes] = await Promise.all([
        axios.get('/api/jobs/statistics'),
        axios.get('/api/jobs/events?limit=5'),
        axios.get('/api/students/all?limit=5')
      ]);

      setStats(statsRes.data.data);
      setRecentDrives(drivesRes.data.data || []);
      setRecentStudents(studentsRes.data.data || []);

      // Prepare chart data
      prepareChartData(statsRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (statsData) => {
    // Department-wise placement chart
    const deptData = {
      labels: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'],
      datasets: [
        {
          label: 'Placement Rate (%)',
          data: [85, 75, 65, 70, 60, 80], // Mock data - replace with actual
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(14, 165, 233, 0.7)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)',
            'rgb(14, 165, 233)'
          ],
          borderWidth: 1
        }
      ]
    };

    setChartData(deptData);
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Department-wise Placement Rate'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Drive Status Distribution'
      }
    }
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Manage placement drives and student activities</p>
        </div>
        <Link
          to="/admin/jobs/new"
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <FaPlus className="mr-2" />
          New Drive
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Students</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.totalStudents || 0}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {stats.placedStudents || 0} placed ({stats.placementRate || 0}%)
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Drives</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.activeEvents || 0}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {stats.upcomingEvents?.length || 0} upcoming
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <FaBuilding className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed Drives</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.completedEvents || 0}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {stats.totalEvents || 0} total
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <FaCalendarCheck className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Placement Rate</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.placementRate || 0}%
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Target: 85%
              </p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <FaChartLine className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          {chartData && <Bar data={chartData} options={barChartOptions} />}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
          <div className="h-64 flex items-center justify-center">
            <Pie 
              data={{
                labels: ['Active', 'Completed', 'Upcoming', 'Closed'],
                datasets: [{
                  data: [stats.activeEvents || 0, stats.completedEvents || 0, 5, 2], // Mock data
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(239, 68, 68, 0.7)'
                  ]
                }]
              }}
              options={pieChartOptions}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Drives */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Recent Drives</h2>
              <Link
                to="/admin/jobs"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="p-5">
            {recentDrives.length > 0 ? (
              <div className="space-y-4">
                {recentDrives.map((drive) => (
                  <div
                    key={drive._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {drive.companyName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{drive.jobTitle}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <FaCalendarCheck className="mr-1" />
                        <span>
                          Drive: {format(new Date(drive.driveDate), 'MMM dd')}
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          Reg: {drive.registeredStudents?.length || 0} students
                        </span>
                      </div>
                    </div>
                    <span className={`ml-4 px-3 py-1 rounded-full text-sm ${
                      drive.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : drive.status === 'Completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {drive.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaBuilding className="text-gray-300 text-4xl mx-auto mb-3" />
                <p className="text-gray-500">No drives scheduled</p>
                <p className="text-gray-400 text-sm mt-1">
                  Create your first placement drive
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Students */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Recent Students</h2>
              <Link
                to="/admin/students"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="p-5">
            {recentStudents.length > 0 ? (
              <div className="space-y-4">
                {recentStudents.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <FaUsers className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {student.registerNumber} • {student.department}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className={`px-2 py-1 rounded text-xs ${
                        student.isPlaced
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.isPlaced ? 'Placed' : 'Seeking'}
                      </div>
                      {student.cgpa && (
                        <div className="text-xs text-gray-500 mt-1">
                          CGPA: {student.cgpa}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaUsers className="text-gray-300 text-4xl mx-auto mb-3" />
                <p className="text-gray-500">No students registered</p>
                <p className="text-gray-400 text-sm mt-1">
                  Students will appear here after registration
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/jobs/new"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <FaPlus className="text-blue-600 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-800">Create New Drive</h3>
            <p className="text-sm text-gray-600 text-center mt-1">
              Post a new placement opportunity
            </p>
          </Link>
          <Link
            to="/admin/students"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="bg-green-50 p-3 rounded-lg mb-3">
              <FaUserCheck className="text-green-600 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-800">Mark as Placed</h3>
            <p className="text-sm text-gray-600 text-center mt-1">
              Update student placement status
            </p>
          </Link>
          <Link
            to="/admin/notifications"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="bg-purple-50 p-3 rounded-lg mb-3">
              <FaBell className="text-purple-600 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-800">Send Notifications</h3>
            <p className="text-sm text-gray-600 text-center mt-1">
              Send announcements to students
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;