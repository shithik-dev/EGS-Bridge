const validator = require('validator');

// Student registration validation
const validateStudentRegistration = (data) => {
  const errors = [];

  if (!data.registerNumber || !data.registerNumber.trim()) {
    errors.push('Register number is required');
  } else if (data.registerNumber.length < 5) {
    errors.push('Register number must be at least 5 characters');
  }

  if (!data.name || !data.name.trim()) {
    errors.push('Name is required');
  }

  if (!data.email || !data.email.trim()) {
    errors.push('Email is required');
  } else if (!validator.isEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!data.department || !data.department.trim()) {
    errors.push('Department is required');
  }

  if (data.cgpa && (data.cgpa < 0 || data.cgpa > 10)) {
    errors.push('CGPA must be between 0 and 10');
  }

  if (data.phone && !validator.isMobilePhone(data.phone, 'en-IN')) {
    errors.push('Invalid phone number format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Placement event validation
const validatePlacementEvent = (data) => {
  const errors = [];

  if (!data.companyName || !data.companyName.trim()) {
    errors.push('Company name is required');
  }

  if (!data.jobTitle || !data.jobTitle.trim()) {
    errors.push('Job title is required');
  }

  if (!data.jobDescription || !data.jobDescription.trim()) {
    errors.push('Job description is required');
  }

  if (!data.eligibleDepartments || !Array.isArray(data.eligibleDepartments) || data.eligibleDepartments.length === 0) {
    errors.push('At least one eligible department is required');
  }

  if (!data.registrationLink || !data.registrationLink.trim()) {
    errors.push('Registration link is required');
  } else if (!validator.isURL(data.registrationLink)) {
    errors.push('Invalid registration link');
  }

  if (!data.registrationDeadline) {
    errors.push('Registration deadline is required');
  } else if (!validator.isDate(data.registrationDeadline)) {
    errors.push('Invalid registration deadline');
  }

  if (!data.driveDate) {
    errors.push('Drive date is required');
  } else if (!validator.isDate(data.driveDate)) {
    errors.push('Invalid drive date');
  }

  if (!data.driveTime || !data.driveTime.trim()) {
    errors.push('Drive time is required');
  }

  // Check dates are valid
  if (data.registrationDeadline && data.driveDate) {
    const deadline = new Date(data.registrationDeadline);
    const driveDate = new Date(data.driveDate);
    
    if (deadline >= driveDate) {
      errors.push('Registration deadline must be before drive date');
    }
    
    if (deadline < new Date()) {
      errors.push('Registration deadline cannot be in the past');
    }
  }

  if (data.eligibilityCriteria?.minCGPA && (data.eligibilityCriteria.minCGPA < 0 || data.eligibilityCriteria.minCGPA > 10)) {
    errors.push('Minimum CGPA must be between 0 and 10');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Login validation
const validateLogin = (data, isStudent = true) => {
  const errors = [];

  if (isStudent) {
    if (!data.registerNumber || !data.registerNumber.trim()) {
      errors.push('Register number is required');
    }
  } else {
    if (!data.email || !data.email.trim()) {
      errors.push('Email is required');
    } else if (!validator.isEmail(data.email)) {
      errors.push('Invalid email format');
    }
  }

  if (!data.password || !data.password.trim()) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation
const validateEmail = (email) => {
  return validator.isEmail(email);
};

// URL validation
const validateURL = (url) => {
  return validator.isURL(url, {
    require_protocol: true,
    protocols: ['http', 'https']
  });
};

// Date validation
const validateDate = (date) => {
  return validator.isDate(date) && new Date(date) > new Date();
};

// Sanitize input
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return validator.trim(validator.escape(input));
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    Object.keys(input).forEach(key => {
      sanitized[key] = sanitizeInput(input[key]);
    });
    return sanitized;
  }
  return input;
};

// Validate department
const isValidDepartment = (department) => {
  const validDepartments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];
  return validDepartments.includes(department.toUpperCase());
};

// Validate CGPA
const isValidCGPA = (cgpa) => {
  const num = parseFloat(cgpa);
  return !isNaN(num) && num >= 0 && num <= 10;
};

module.exports = {
  validateStudentRegistration,
  validatePlacementEvent,
  validateLogin,
  validateEmail,
  validateURL,
  validateDate,
  sanitizeInput,
  isValidDepartment,
  isValidCGPA
};