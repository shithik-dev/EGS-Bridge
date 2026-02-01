const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  registerNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT']
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  skills: [{
    type: String,
    trim: true
  }],
  phone: {
    type: String,
    trim: true
  },
  yearOfPassing: {
    type: Number,
    default: new Date().getFullYear()
  },
  isPlaced: {
    type: Boolean,
    default: false
  },
  placedCompany: {
    type: String,
    trim: true
  },
  placedPackage: {
    type: Number
  },
  registeredEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementEvent'
  }],
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
studentSchema.index({ registerNumber: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ department: 1 });
studentSchema.index({ isPlaced: 1 });

// Update timestamp on save
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Student', studentSchema);