const express = require('express');
const router = express.Router();
const {
  getStudentProfile,
  updateStudentProfile,
  getRegisteredEvents,
  getStudentStatistics,
  markAsPlaced,
  getAllStudents,
  getAllPlacedStudents,
  deleteStudent
} = require('../controllers/studentController');
const { auth, studentAuth, adminAuth } = require('../middleware/auth');

// Student routes
router.get('/profile', auth, studentAuth, getStudentProfile);
router.put('/profile', auth, studentAuth, updateStudentProfile);
router.get('/registered-events', auth, studentAuth, getRegisteredEvents);
router.get('/statistics', auth, studentAuth, getStudentStatistics);

// Public route for placed students (for homepage testimonials)
router.get('/placed', getAllPlacedStudents);

// Admin routes for student management
router.get('/all', auth, adminAuth, getAllStudents);
router.post('/mark-placed', auth, adminAuth, markAsPlaced);
router.delete('/:id', auth, adminAuth, deleteStudent);

module.exports = router;