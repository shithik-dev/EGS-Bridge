const mongoose = require('mongoose');

const reminderLogSchema = new mongoose.Schema({
  placementEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementEvent',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  reminderType: {
    type: String,
    enum: ['POSTED', '24_HOURS_BEFORE', 'DEADLINE_TODAY', 'DRIVE_DAY'],
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  sentVia: [String],
  status: {
    type: String,
    enum: ['SENT', 'FAILED'],
    default: 'SENT'
  }
});

module.exports = mongoose.model('ReminderLog', reminderLogSchema);