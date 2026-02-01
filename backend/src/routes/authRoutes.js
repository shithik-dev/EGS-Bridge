const express = require('express');
const router = express.Router();
const { 
  registerStudent, 
  loginStudent, 
  loginPlacementOfficer, 
  getProfile 
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register/student', registerStudent);
router.post('/login/student', loginStudent);
router.post('/login/admin', loginPlacementOfficer);

// Protected routes
router.get('/profile', auth, getProfile);

module.exports = router;