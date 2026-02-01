import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle specific error statuses
    switch (status) {
      case 401:
        // Unauthorized - clear local storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        break;

      case 403:
        toast.error('Access denied. You do not have permission.');
        break;

      case 404:
        toast.error('Resource not found.');
        break;

      case 422:
        // Validation errors
        if (data.errors) {
          Object.values(data.errors).forEach((errorMsg) => {
            toast.error(errorMsg);
          });
        } else {
          toast.error(data.error || 'Validation failed');
        }
        break;

      case 429:
        toast.error('Too many requests. Please try again later.');
        break;

      case 500:
        toast.error('Server error. Please try again later.');
        break;

      default:
        if (data.error) {
          toast.error(data.error);
        } else {
          toast.error('An unexpected error occurred');
        }
    }

    return Promise.reject(error);
  }
);

// API endpoints
const endpoints = {
  // Auth
  auth: {
    registerStudent: '/auth/register/student',
    loginStudent: '/auth/login/student',
    loginAdmin: '/auth/login/admin',
    getProfile: '/auth/profile',
  },

  // Jobs
  jobs: {
    getEvents: '/jobs/events',
    getEvent: (id) => `/jobs/events/${id}`,
    createEvent: '/jobs/events',
    updateEvent: (id) => `/jobs/events/${id}`,
    deleteEvent: (id) => `/jobs/events/${id}`,
    registerForEvent: (id) => `/jobs/events/${id}/register`,
    getStatistics: '/jobs/statistics',
  },

  // Students
  students: {
    getProfile: '/students/profile',
    updateProfile: '/students/profile',
    getRegisteredEvents: '/students/registered-events',
    getStatistics: '/students/statistics',
    getAllStudents: '/students/all',
    getPlacedStudents: '/students/placed',
    markAsPlaced: '/students/mark-placed',
    deleteStudent: (id) => `/students/${id}`,
  },

  // Notifications
  notifications: {
    getNotifications: '/notifications',
    markAsRead: (id) => `/notifications/${id}/read`,
    markAllAsRead: '/notifications/read-all',
    deleteNotification: (id) => `/notifications/${id}`,
    getStats: '/notifications/stats',
    createNotification: '/notifications/create',
  },

  // Reminders
  reminders: {
    getEventReminders: (eventId) => `/reminders/event/${eventId}`,
    getStudentReminders: '/reminders/student',
    triggerReminders: '/reminders/trigger',
    getStats: '/reminders/stats',
    resendFailed: '/reminders/resend-failed',
  },
};

// Helper functions for common API calls
export const apiService = {
  // Auth
  registerStudent: (data) => api.post(endpoints.auth.registerStudent, data),
  loginStudent: (data) => api.post(endpoints.auth.loginStudent, data),
  loginAdmin: (data) => api.post(endpoints.auth.loginAdmin, data),
  getProfile: () => api.get(endpoints.auth.getProfile),

  // Jobs
  getJobs: (params) => api.get(endpoints.jobs.getEvents, { params }),
  getJob: (id) => api.get(endpoints.jobs.getEvent(id)),
  createJob: (data) => api.post(endpoints.jobs.createEvent, data),
  updateJob: (id, data) => api.put(endpoints.jobs.updateEvent(id), data),
  deleteJob: (id) => api.delete(endpoints.jobs.deleteEvent(id)),
  registerForJob: (id) => api.post(endpoints.jobs.registerForEvent(id)),
  getJobStatistics: () => api.get(endpoints.jobs.getStatistics),

  // Students
  getStudentProfile: () => api.get(endpoints.students.getProfile),
  updateStudentProfile: (data) => api.put(endpoints.students.updateProfile, data),
  getRegisteredEvents: () => api.get(endpoints.students.getRegisteredEvents),
  getStudentStatistics: () => api.get(endpoints.students.getStatistics),
  getAllStudents: (params) => api.get(endpoints.students.getAllStudents, { params }),
  getPlacedStudents: (params) => api.get(endpoints.students.getPlacedStudents, { params }),
  markStudentAsPlaced: (data) => api.post(endpoints.students.markAsPlaced, data),
  deleteStudent: (id) => api.delete(endpoints.students.deleteStudent(id)),

  // Notifications
  getNotifications: (params) => api.get(endpoints.notifications.getNotifications, { params }),
  markNotificationAsRead: (id) => api.put(endpoints.notifications.markAsRead(id)),
  markAllNotificationsAsRead: () => api.put(endpoints.notifications.markAllAsRead),
  deleteNotification: (id) => api.delete(endpoints.notifications.deleteNotification(id)),
  getNotificationStats: () => api.get(endpoints.notifications.getStats),
  createNotification: (data) => api.post(endpoints.notifications.createNotification, data),

  // Reminders
  getEventReminders: (eventId) => api.get(endpoints.reminders.getEventReminders(eventId)),
  getStudentReminders: () => api.get(endpoints.reminders.getStudentReminders),
  triggerReminders: (data) => api.post(endpoints.reminders.triggerReminders, data),
  getReminderStats: (params) => api.get(endpoints.reminders.getStats, { params }),
  resendFailedReminders: () => api.post(endpoints.reminders.resendFailed),

  // File upload helper
  uploadFile: (file, type = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Health check
  healthCheck: () => api.get('/health'),

  // Set auth token manually (for external auth systems)
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Clear auth token
  clearAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  },
};

export default api;