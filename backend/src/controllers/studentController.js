const Student = require('../models/Student');
const PlacementEvent = require('../models/PlacementEvent');
const Notification = require('../models/Notification');

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id)
      .select('-password')
      .populate({
        path: 'notifications',
        options: { sort: { createdAt: -1 }, limit: 10 }
      });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ error: 'Server error fetching student profile' });
  }
};

// Update student profile
const updateStudentProfile = async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = ['name', 'email', 'phone', 'cgpa', 'skills'];

    // Filter updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'skills' && typeof req.body[key] === 'string') {
          updates[key] = req.body[key].split(',').map(skill => skill.trim());
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    const student = await Student.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: student
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

// Get student's registered events
const getRegisteredEvents = async (req, res) => {
  try {
    const events = await PlacementEvent.find({
      registeredStudents: req.user._id,
      status: { $in: ['Active', 'Completed'] }
    })
    .sort({ driveDate: 1 })
    .select('companyName jobTitle driveDate driveTime mode status');

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get registered events error:', error);
    res.status(500).json({ error: 'Server error fetching registered events' });
  }
};

// Get student statistics
const getStudentStatistics = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);

    const totalEvents = await PlacementEvent.countDocuments({
      eligibleDepartments: { $in: [student.department] },
      'eligibilityCriteria.minCGPA': { $lte: student.cgpa || 0 },
      status: 'Active'
    });

    const registeredEvents = await PlacementEvent.countDocuments({
      registeredStudents: req.user._id
    });

    const upcomingEvents = await PlacementEvent.countDocuments({
      registeredStudents: req.user._id,
      driveDate: { $gte: new Date() },
      status: 'Active'
    });

    const missedDeadlines = await PlacementEvent.countDocuments({
      eligibleDepartments: { $in: [student.department] },
      'eligibilityCriteria.minCGPA': { $lte: student.cgpa || 0 },
      registrationDeadline: { $lt: new Date() },
      registeredStudents: { $ne: req.user._id }
    });

    res.json({
      success: true,
      data: {
        totalEvents,
        registeredEvents,
        upcomingEvents,
        missedDeadlines,
        placementStatus: student.isPlaced ? 'Placed' : 'Not Placed',
        placedCompany: student.placedCompany,
        placedPackage: student.placedPackage
      }
    });
  } catch (error) {
    console.error('Student statistics error:', error);
    res.status(500).json({ error: 'Server error fetching statistics' });
  }
};

// Mark student as placed (Admin only)
const markAsPlaced = async (req, res) => {
  try {
    const { studentId, company, package: pkg } = req.body;

    if (!studentId || !company) {
      return res.status(400).json({ error: 'Student ID and company are required' });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      {
        isPlaced: true,
        placedCompany: company,
        placedPackage: pkg || null
      },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Create congratulation notification
    const notification = new Notification({
      student: student._id,
      type: 'STATUS_UPDATE',
      title: '🎉 Congratulations! Placement Success',
      message: `You have been placed at ${company}${pkg ? ` with package ₹${pkg} LPA` : ''}.`,
      priority: 'HIGH'
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Student marked as placed successfully',
      data: student
    });
  } catch (error) {
    console.error('Mark as placed error:', error);
    res.status(500).json({ error: 'Server error marking student as placed' });
  }
};

// Get placed students (Public - for homepage testimonials)
const getAllPlacedStudents = async (req, res) => {
  try {
    const { limit } = req.query;
    const queryLimit = parseInt(limit) || 5;
    
    const students = await Student.find({ isPlaced: true })
      .select('name department placedCompany placedPackage')
      .sort({ updatedAt: -1 })
      .limit(queryLimit);

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Get placed students error:', error);
    res.status(500).json({ error: 'Server error fetching placed students' });
  }
};

// Get all students (Admin only)
const getAllStudents = async (req, res) => {
  try {
    const { department, isPlaced, search } = req.query;
    const filter = {};

    if (department) {
      filter.department = department;
    }

    if (isPlaced !== undefined) {
      filter.isPlaced = isPlaced === 'true';
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { registerNumber: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const students = await Student.find(filter)
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ error: 'Server error fetching students' });
  }
};

// Delete student (Admin only)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Remove student from registered events
    await PlacementEvent.updateMany(
      { registeredStudents: student._id },
      { $pull: { registeredStudents: student._id } }
    );

    // Delete student's notifications
    await Notification.deleteMany({ student: student._id });

    // Delete student
    await student.deleteOne();

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Server error deleting student' });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getRegisteredEvents,
  getStudentStatistics,
  markAsPlaced,
  getAllStudents,
  getAllPlacedStudents,
  deleteStudent
};