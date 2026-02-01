const express = require('express');
const router = express.Router();
const {
  createPlacementEvent,
  getPlacementEvents,
  getPlacementEvent,
  registerForEvent,
  updatePlacementEvent,
  deletePlacementEvent,
  getStatistics
} = require('../controllers/jobController');
const { auth, adminAuth, studentAuth } = require('../middleware/auth');

// Public route - get events (filtered by auth)
router.get('/events', auth, getPlacementEvents);
router.get('/events/:id', auth, getPlacementEvent);

// Student only routes
router.post('/events/:id/register', auth, studentAuth, registerForEvent);

// Admin only routes
router.post('/events', auth, adminAuth, createPlacementEvent);
router.put('/events/:id', auth, adminAuth, updatePlacementEvent);
router.delete('/events/:id', auth, adminAuth, deletePlacementEvent);
router.get('/statistics', auth, adminAuth, getStatistics);

module.exports = router;