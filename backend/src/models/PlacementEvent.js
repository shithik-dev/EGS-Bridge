const mongoose = require('mongoose');

const placementEventSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  eligibleDepartments: [{
    type: String,
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'],
    required: true
  }],
  eligibilityCriteria: {
    minCGPA: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    requiredSkills: [String],
    backlogAllowed: {
      type: Boolean,
      default: false
    },
    yearOfPassing: {
      type: Number,
      default: new Date().getFullYear()
    }
  },
  registrationLink: {
    type: String,
    required: true
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  driveDate: {
    type: Date,
    required: true
  },
  driveTime: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['Online', 'Offline', 'Hybrid'],
    default: 'Offline'
  },
  venue: {
    type: String,
    default: 'College Placement Cell'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementOfficer',
    required: true
  },
  registeredStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  status: {
    type: String,
    enum: ['Active', 'Closed', 'Completed'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
placementEventSchema.index({ registrationDeadline: 1 });
placementEventSchema.index({ driveDate: 1 });
placementEventSchema.index({ eligibleDepartments: 1 });

module.exports = mongoose.model('PlacementEvent', placementEventSchema);