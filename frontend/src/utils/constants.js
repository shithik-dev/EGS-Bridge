// Application Constants

export const APP_NAME = 'EGS Bridge';
export const APP_TAGLINE = 'Bridging students to the right opportunity at the right time';
export const APP_VERSION = '1.0.0';

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  PLACEMENT_OFFICER: 'placement_officer',
  ADMIN: 'admin'
};

// Departments
export const DEPARTMENTS = [
  'CSE',
  'ECE', 
  'EEE',
  'MECH',
  'CIVIL',
  'IT'
];

// Drive Modes
export const DRIVE_MODES = [
  { value: 'Online', label: 'Online', color: 'green' },
  { value: 'Offline', label: 'Offline', color: 'purple' },
  { value: 'Hybrid', label: 'Hybrid', color: 'blue' }
];

// Job Status
export const JOB_STATUS = {
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  COMPLETED: 'Completed'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  JOB_POSTED: 'JOB_POSTED',
  DEADLINE_REMINDER: 'DEADLINE_REMINDER',
  DRIVE_DAY: 'DRIVE_DAY',
  STATUS_UPDATE: 'STATUS_UPDATE'
};

// Notification Priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

// Reminder Types
export const REMINDER_TYPES = {
  POSTED: 'POSTED',
  HOURS_24_BEFORE: '24_HOURS_BEFORE',
  DEADLINE_TODAY: 'DEADLINE_TODAY',
  DRIVE_DAY: 'DRIVE_DAY'
};

// Colors for different priorities
export const PRIORITY_COLORS = {
  URGENT: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  },
  HIGH: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200'
  },
  MEDIUM: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  LOW: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  }
};

// Time Constants
export const TIME_CONSTANTS = {
  ONE_HOUR_MS: 60 * 60 * 1000,
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 25, 50, 100]
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM dd, yyyy',
  DISPLAY_DATETIME: 'MMM dd, yyyy hh:mm a',
  DISPLAY_TIME: 'hh:mm a',
  API_DATE: 'yyyy-MM-dd',
  API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
};

// Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_CGPA: 0,
  MAX_CGPA: 10,
  PHONE_REGEX: /^[6-9]\d{9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  REGISTER_NUMBER_REGEX: /^[A-Za-z0-9\-_]+$/,
  URL_REGEX: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
};

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid 10-digit phone number',
  INVALID_CGPA: 'CGPA must be between 0 and 10',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_URL: 'Please enter a valid URL',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You need to login to access this resource',
  FORBIDDEN: 'You do not have permission to perform this action'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful! Welcome to EGS Bridge',
  LOGIN_SUCCESS: 'Login successful!',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
  JOB_CREATE_SUCCESS: 'Placement drive created successfully',
  JOB_UPDATE_SUCCESS: 'Placement drive updated successfully',
  JOB_DELETE_SUCCESS: 'Placement drive deleted successfully',
  REGISTRATION_SUCCESS_JOB: 'Successfully registered for the placement drive',
  NOTIFICATION_READ_SUCCESS: 'Notification marked as read',
  ALL_NOTIFICATIONS_READ_SUCCESS: 'All notifications marked as read',
  NOTIFICATION_DELETE_SUCCESS: 'Notification deleted successfully'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER_STUDENT: '/api/auth/register/student',
  LOGIN_STUDENT: '/api/auth/login/student',
  LOGIN_ADMIN: '/api/auth/login/admin',
  PROFILE: '/api/auth/profile',
  
  // Jobs
  JOBS: '/api/jobs/events',
  JOB_STATISTICS: '/api/jobs/statistics',
  
  // Students
  STUDENT_PROFILE: '/api/students/profile',
  STUDENT_STATISTICS: '/api/students/statistics',
  
  // Notifications
  NOTIFICATIONS: '/api/notifications',
  
  // Upload
  UPLOAD: '/api/upload',
  
  // Health
  HEALTH: '/api/health'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS_LAST_CHECKED: 'notifications_last_checked'
};

// Feature Flags (for future features)
export const FEATURE_FLAGS = {
  ENABLE_WHATSAPP_NOTIFICATIONS: false,
  ENABLE_SMS_NOTIFICATIONS: false,
  ENABLE_RESUME_UPLOAD: true,
  ENABLE_INTERVIEW_SCHEDULING: false,
  ENABLE_COMPANY_DASHBOARD: false
};

// Demo Credentials (for testing)
export const DEMO_CREDENTIALS = {
  STUDENT: {
    registerNumber: '20BCS001',
    password: 'password123'
  },
  ADMIN: {
    email: 'admin@egsbridge.edu',
    password: 'admin123'
  }
};

// Company Logos (for demo)
export const COMPANY_LOGOS = {
  'TCS': 'https://logo.clearbit.com/tcs.com',
  'Infosys': 'https://logo.clearbit.com/infosys.com',
  'Wipro': 'https://logo.clearbit.com/wipro.com',
  'Accenture': 'https://logo.clearbit.com/accenture.com',
  'Amazon': 'https://logo.clearbit.com/amazon.com',
  'Microsoft': 'https://logo.clearbit.com/microsoft.com',
  'Google': 'https://logo.clearbit.com/google.com',
  'IBM': 'https://logo.clearbit.com/ibm.com'
};

// Default Values
export const DEFAULTS = {
  DRIVE_TIME: '10:00',
  VENUE: 'College Placement Cell',
  MIN_CGPA: 0,
  YEAR_OF_PASSING: new Date().getFullYear()
};

export default {
  APP_NAME,
  APP_TAGLINE,
  USER_ROLES,
  DEPARTMENTS,
  DRIVE_MODES,
  JOB_STATUS,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  REMINDER_TYPES,
  PRIORITY_COLORS,
  TIME_CONSTANTS,
  PAGINATION,
  DATE_FORMATS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  API_ENDPOINTS,
  STORAGE_KEYS,
  FEATURE_FLAGS,
  DEMO_CREDENTIALS,
  COMPANY_LOGOS,
  DEFAULTS
};