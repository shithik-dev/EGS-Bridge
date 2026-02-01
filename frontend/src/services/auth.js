import { apiService } from './api';

class AuthService {
  // Student registration
  async registerStudent(studentData) {
    try {
      const response = await apiService.registerStudent(studentData);
      
      if (response.data.success) {
        this.setSession(response.data.token, response.data.user);
        return { success: true, data: response.data };
      }
      
      return { success: false, error: response.data.error };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  }

  // Student login
  async loginStudent(credentials) {
    try {
      const response = await apiService.loginStudent(credentials);
      
      if (response.data.success) {
        this.setSession(response.data.token, response.data.user);
        return { success: true, data: response.data };
      }
      
      return { success: false, error: response.data.error };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  }

  // Placement officer login
  async loginAdmin(credentials) {
    try {
      const response = await apiService.loginAdmin(credentials);
      
      if (response.data.success) {
        this.setSession(response.data.token, response.data.user);
        return { success: true, data: response.data };
      }
      
      return { success: false, error: response.data.error };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await apiService.getProfile();
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch profile' 
      };
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.updateStudentProfile(profileData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update profile' 
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Check if user is admin
  isAdmin() {
    const user = this.getUser();
    return user?.role === 'placement_officer';
  }

  // Check if user is student
  isStudent() {
    const user = this.getUser();
    return user?.role === 'student';
  }

  // Get user department
  getUserDepartment() {
    const user = this.getUser();
    return user?.department || '';
  }

  // Get user CGPA
  getUserCGPA() {
    const user = this.getUser();
    return user?.cgpa || 0;
  }

  // Set session data
  setSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    apiService.setAuthToken(token);
  }

  // Get token
  getToken() {
    return localStorage.getItem('token');
  }

  // Get user data
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Clear session (logout)
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    apiService.clearAuthToken();
  }

  // Validate registration data
  validateRegistration(data) {
    const errors = {};

    if (!data.registerNumber?.trim()) {
      errors.registerNumber = 'Register number is required';
    }

    if (!data.name?.trim()) {
      errors.name = 'Name is required';
    }

    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(data.email)) {
      errors.email = 'Invalid email format';
    }

    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!data.department?.trim()) {
      errors.department = 'Department is required';
    }

    if (data.cgpa && (data.cgpa < 0 || data.cgpa > 10)) {
      errors.cgpa = 'CGPA must be between 0 and 10';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate login data
  validateLogin(data, isStudent = true) {
    const errors = {};

    if (isStudent) {
      if (!data.registerNumber?.trim()) {
        errors.registerNumber = 'Register number is required';
      }
    } else {
      if (!data.email?.trim()) {
        errors.email = 'Email is required';
      } else if (!this.isValidEmail(data.email)) {
        errors.email = 'Invalid email format';
      }
    }

    if (!data.password?.trim()) {
      errors.password = 'Password is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password strength check
  checkPasswordStrength(password) {
    if (!password) return 'weak';

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;

    let score = 0;
    if (hasLower) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    if (length >= 8) score++;

    if (score >= 5) return 'strong';
    if (score >= 3) return 'medium';
    return 'weak';
  }

  // Department validation
  isValidDepartment(department) {
    const validDepartments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];
    return validDepartments.includes(department.toUpperCase());
  }

  // Get user initials for avatar
  getUserInitials(name = '') {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Check if user has permission for action
  hasPermission(action) {
    const user = this.getUser();
    if (!user) return false;

    // Student permissions
    const studentPermissions = [
      'view_jobs',
      'register_jobs',
      'view_notifications',
      'update_profile'
    ];

    // Admin permissions
    const adminPermissions = [
      ...studentPermissions,
      'create_jobs',
      'edit_jobs',
      'delete_jobs',
      'manage_students',
      'send_notifications',
      'view_analytics'
    ];

    const permissions = user.role === 'placement_officer' ? adminPermissions : studentPermissions;
    return permissions.includes(action);
  }

  // Refresh token (if implemented)
  async refreshToken() {
    try {
      // This would call a refresh token endpoint
      // For now, just check if token exists
      const token = this.getToken();
      if (!token) {
        this.logout();
        return false;
      }
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  // Check session validity
  async checkSession() {
    try {
      const response = await apiService.getProfile();
      return response.data.success;
    } catch (error) {
      if (error.response?.status === 401) {
        this.logout();
      }
      return false;
    }
  }
}

export default new AuthService();