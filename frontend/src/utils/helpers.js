import { format, formatDistance, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import constants from './constants';

// Date Formatting Helpers
export const formatDate = (date, formatStr = constants.DATE_FORMATS.DISPLAY_DATE) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (!isValid(dateObj)) return 'Invalid Date';
    
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, constants.DATE_FORMATS.DISPLAY_DATETIME);
};

export const formatTime = (date) => {
  return formatDate(date, constants.DATE_FORMATS.DISPLAY_TIME);
};

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (!isValid(dateObj)) return 'Invalid Date';
    
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Invalid Date';
  }
};

export const getTimeRemaining = (deadline) => {
  if (!deadline) return 'No deadline';
  
  try {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    
    if (!isValid(deadlineDate)) return 'Invalid deadline';
    
    if (deadlineDate < now) {
      return 'Deadline passed';
    }
    
    const diffMs = deadlineDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours > 0 ? `${diffHours} hour${diffHours > 1 ? 's' : ''}` : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'Less than an hour';
    }
  } catch (error) {
    console.error('Time remaining calculation error:', error);
    return 'Error';
  }
};

// String Helpers
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

export const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Number Helpers
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '0';
  
  return Number(num).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined) return '₹0';
  
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

export const formatPackage = (lpa) => {
  if (!lpa) return 'Not disclosed';
  return `₹${formatNumber(lpa, 1)} LPA`;
};

// Validation Helpers
export const isValidEmail = (email) => {
  return constants.VALIDATION.EMAIL_REGEX.test(email);
};

export const isValidPhone = (phone) => {
  return constants.VALIDATION.PHONE_REGEX.test(phone);
};

export const isValidCGPA = (cgpa) => {
  const num = parseFloat(cgpa);
  return !isNaN(num) && num >= 0 && num <= 10;
};

export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validatePassword = (password) => {
  if (!password) return { valid: false, message: 'Password is required' };
  if (password.length < constants.VALIDATION.MIN_PASSWORD_LENGTH) {
    return { 
      valid: false, 
      message: `Password must be at least ${constants.VALIDATION.MIN_PASSWORD_LENGTH} characters` 
    };
  }
  return { valid: true, message: 'Password is valid' };
};

// Array Helpers
export const uniqueArray = (array) => {
  return [...new Set(array)];
};

export const sortByKey = (array, key, ascending = true) => {
  return [...array].sort((a, b) => {
    let aValue = a[key];
    let bValue = b[key];
    
    // Handle dates
    if (key.includes('Date') || key.includes('Time')) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (aValue < bValue) return ascending ? -1 : 1;
    if (aValue > bValue) return ascending ? 1 : -1;
    return 0;
  });
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const groupKey = item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};

// Object Helpers
export const cleanObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    )
  );
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const mergeObjects = (obj1, obj2) => {
  return { ...obj1, ...obj2 };
};

// Job/Event Helpers
export const isEligibleForJob = (student, job) => {
  if (!student || !job) return false;
  
  // Check department
  if (!job.eligibleDepartments.includes(student.department)) {
    return false;
  }
  
  // Check CGPA
  const minCGPA = job.eligibilityCriteria?.minCGPA || 0;
  if (student.cgpa < minCGPA) {
    return false;
  }
  
  // Check backlog (if specified)
  if (job.eligibilityCriteria?.backlogAllowed === false && student.hasBacklogs) {
    return false;
  }
  
  return true;
};

export const getJobStatus = (job) => {
  if (!job) return 'Unknown';
  
  const now = new Date();
  const deadline = new Date(job.registrationDeadline);
  const driveDate = new Date(job.driveDate);
  
  if (job.status === 'Completed') return 'Completed';
  if (job.status === 'Closed') return 'Closed';
  
  if (deadline < now) return 'Registration Closed';
  if (driveDate < now) return 'Drive Completed';
  
  const daysUntilDeadline = Math.ceil((deadline - now) / constants.TIME_CONSTANTS.ONE_DAY_MS);
  
  if (daysUntilDeadline <= 0) return 'Deadline Today';
  if (daysUntilDeadline <= 1) return 'Deadline Tomorrow';
  if (daysUntilDeadline <= 3) return 'Deadline Soon';
  
  return 'Registration Open';
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Registration Open':
    case 'Active':
      return 'green';
    case 'Deadline Soon':
    case 'Deadline Tomorrow':
      return 'yellow';
    case 'Deadline Today':
      return 'orange';
    case 'Registration Closed':
    case 'Closed':
      return 'red';
    case 'Drive Completed':
    case 'Completed':
      return 'blue';
    default:
      return 'gray';
  }
};

// Notification Helpers
export const getNotificationIcon = (type) => {
  switch (type) {
    case constants.NOTIFICATION_TYPES.JOB_POSTED:
      return '📢';
    case constants.NOTIFICATION_TYPES.DEADLINE_REMINDER:
      return '⏰';
    case constants.NOTIFICATION_TYPES.DRIVE_DAY:
      return '🎯';
    case constants.NOTIFICATION_TYPES.STATUS_UPDATE:
      return '📋';
    default:
      return '🔔';
  }
};

export const getPriorityColor = (priority) => {
  return constants.PRIORITY_COLORS[priority] || constants.PRIORITY_COLORS.MEDIUM;
};

// File Helpers
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// URL Helpers
export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => query.append(key, v));
      } else {
        query.append(key, value);
      }
    }
  });
  
  return query.toString();
};

export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
};

// Storage Helpers
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Debounce Helper
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle Helper
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Random Helpers
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

export const getRandomColor = () => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9',
    '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

// Error Handling
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.error || constants.ERROR_MESSAGES.SERVER_ERROR,
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: constants.ERROR_MESSAGES.NETWORK_ERROR,
      status: 0
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1
    };
  }
};

// Export all helpers
export default {
  // Date
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  getTimeRemaining,
  
  // String
  capitalize,
  truncateText,
  slugify,
  
  // Number
  formatNumber,
  formatCurrency,
  formatPackage,
  
  // Validation
  isValidEmail,
  isValidPhone,
  isValidCGPA,
  isValidURL,
  validatePassword,
  
  // Array
  uniqueArray,
  sortByKey,
  groupBy,
  
  // Object
  cleanObject,
  deepClone,
  mergeObjects,
  
  // Job/Event
  isEligibleForJob,
  getJobStatus,
  getStatusColor,
  
  // Notification
  getNotificationIcon,
  getPriorityColor,
  
  // File
  formatFileSize,
  getFileExtension,
  
  // URL
  buildQueryString,
  getQueryParams,
  
  // Storage
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  
  // Performance
  debounce,
  throttle,
  
  // Random
  generateId,
  getRandomColor,
  
  // Error
  handleApiError
};