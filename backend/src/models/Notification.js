const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  placementEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementEvent',
    required: true
  },
  type: {
    type: String,
    enum: ['JOB_POSTED', 'DEADLINE_REMINDER', 'DRIVE_DAY', 'STATUS_UPDATE'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  scheduledFor: {
    type: Date
  },
  sentVia: [{
    type: String,
    enum: ['IN_APP', 'EMAIL']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);