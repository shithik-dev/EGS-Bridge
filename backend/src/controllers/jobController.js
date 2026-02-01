const PlacementEvent = require('../models/PlacementEvent');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { sendEmailNotification } = require('../utils/emailService');

// Create new placement event
const createPlacementEvent = async (req, res) => {
  try {
    const {
      companyName,
      jobTitle,
      jobDescription,
      eligibleDepartments,
      eligibilityCriteria,
      registrationLink,
      registrationDeadline,
      driveDate,
      driveTime,
      mode,
      venue
    } = req.body;

    if (!companyName || !jobTitle || !jobDescription || !eligibleDepartments || !registrationLink || 
        !registrationDeadline || !driveDate || !driveTime) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    const placementEvent = new PlacementEvent({
      companyName,
      jobTitle,
      jobDescription,
      eligibleDepartments,
      eligibilityCriteria: eligibilityCriteria || {},
      registrationLink,
      registrationDeadline: new Date(registrationDeadline),
      driveDate: new Date(driveDate),
      driveTime,
      mode: mode || 'Offline',
      venue: venue || 'College Placement Cell',
      postedBy: req.user._id,
      status: 'Active'
    });

    await placementEvent.save();

    // Find eligible students
    const eligibleStudents = await Student.find({
      department: { $in: eligibleDepartments },
      cgpa: { $gte: eligibilityCriteria?.minCGPA || 0 },
      isPlaced: false
    });

    // Create notifications for eligible students
    const notificationPromises = eligibleStudents.map(async (student) => {
      const notification = new Notification({
        student: student._id,
        placementEvent: placementEvent._id,
        type: 'JOB_POSTED',
        title: `New Placement Drive: ${companyName}`,
        message: `A new placement drive for ${companyName} has been posted. Registration deadline: ${new Date(registrationDeadline).toLocaleDateString()}`,
        priority: 'HIGH',
        sentVia: ['IN_APP']
      });

      await notification.save();
      
      // Add notification to student
      student.notifications.push(notification._id);
      await student.save();

      // Send email notification
      try {
        await sendEmailNotification(
          student.email,
          `New Placement Drive: ${companyName}`,
          `Dear ${student.name},\n\nA new placement drive for ${companyName} has been posted.\nPosition: ${jobTitle}\nRegistration Deadline: ${new Date(registrationDeadline).toLocaleDateString()}\nDrive Date: ${new Date(driveDate).toLocaleDateString()}\n\nLogin to EGS Bridge for more details.\n\nBest regards,\nPlacement Cell`
        );
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }

      return notification;
    });

    await Promise.all(notificationPromises);

    res.status(201).json({
      success: true,
      message: 'Placement event created successfully',
      data: placementEvent,
      eligibleStudents: eligibleStudents.length
    });
  } catch (error) {
    console.error('Create placement event error:', error);
    res.status(500).json({ error: 'Server error creating placement event' });
  }
};

// Get all placement events (with filters)
const getPlacementEvents = async (req, res) => {
  try {
    const { department, status, company, mode } = req.query;
    const filter = {};

    // Apply filters
    if (department) {
      filter.eligibleDepartments = { $in: [department] };
    }

    if (status) {
      filter.status = status;
    }

    if (company) {
      filter.companyName = new RegExp(company, 'i');
    }

    if (mode) {
      filter.mode = mode;
    }

    // For students, show only active events
    if (req.user.role === 'student') {
      filter.status = 'Active';
      filter.registrationDeadline = { $gte: new Date() };
      
      // Filter by student's department and eligibility
      filter.eligibleDepartments = { $in: [req.user.department] };
      if (req.user.cgpa) {
        filter['eligibilityCriteria.minCGPA'] = { $lte: req.user.cgpa };
      }
    }

    const events = await PlacementEvent.find(filter)
      .populate('postedBy', 'name email')
      .sort({ registrationDeadline: 1 });

    // For students, add registration status
    if (req.user.role === 'student') {
      const eventsWithStatus = events.map(event => {
        const isRegistered = event.registeredStudents.some(
          studentId => studentId.toString() === req.user._id.toString()
        );
        return {
          ...event.toObject(),
          isRegistered,
          canRegister: new Date(event.registrationDeadline) > new Date()
        };
      });
      return res.json({ success: true, data: eventsWithStatus });
    }

    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Server error fetching placement events' });
  }
};

// Get single placement event
const getPlacementEvent = async (req, res) => {
  try {
    const event = await PlacementEvent.findById(req.params.id)
      .populate('postedBy', 'name email')
      .populate('registeredStudents', 'name registerNumber department cgpa');

    if (!event) {
      return res.status(404).json({ error: 'Placement event not found' });
    }

    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Server error fetching placement event' });
  }
};

// Register student for placement event
const registerForEvent = async (req, res) => {
  try {
    const event = await PlacementEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Placement event not found' });
    }

    // Check if registration is open
    if (event.status !== 'Active') {
      return res.status(400).json({ error: 'Registration is closed for this event' });
    }

    if (new Date(event.registrationDeadline) < new Date()) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }

    // Check if student is eligible
    if (!event.eligibleDepartments.includes(req.user.department)) {
      return res.status(400).json({ error: 'Your department is not eligible for this drive' });
    }

    if (req.user.cgpa < (event.eligibilityCriteria.minCGPA || 0)) {
      return res.status(400).json({ error: 'You do not meet the minimum CGPA requirement' });
    }

    // Check if already registered
    if (event.registeredStudents.includes(req.user._id)) {
      return res.status(400).json({ error: 'You are already registered for this event' });
    }

    // Register student
    event.registeredStudents.push(req.user._id);
    await event.save();

    // Create notification
    const notification = new Notification({
      student: req.user._id,
      placementEvent: event._id,
      type: 'STATUS_UPDATE',
      title: `Registration Successful: ${event.companyName}`,
      message: `You have successfully registered for ${event.companyName} drive. Drive date: ${event.driveDate.toLocaleDateString()}`,
      priority: 'MEDIUM'
    });

    await notification.save();

    // Add notification to student
    await Student.findByIdAndUpdate(req.user._id, {
      $push: { notifications: notification._id }
    });

    res.json({
      success: true,
      message: 'Successfully registered for the placement drive'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Update placement event
const updatePlacementEvent = async (req, res) => {
  try {
    const event = await PlacementEvent.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ error: 'Placement event not found' });
    }

    res.json({
      success: true,
      message: 'Placement event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Server error updating placement event' });
  }
};

// Delete placement event
const deletePlacementEvent = async (req, res) => {
  try {
    const event = await PlacementEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Placement event not found' });
    }

    await event.deleteOne();
    
    // Delete associated notifications
    await Notification.deleteMany({ placementEvent: event._id });

    res.json({
      success: true,
      message: 'Placement event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Server error deleting placement event' });
  }
};

// Get statistics
const getStatistics = async (req, res) => {
  try {
    const totalEvents = await PlacementEvent.countDocuments();
    const activeEvents = await PlacementEvent.countDocuments({ status: 'Active' });
    const completedEvents = await PlacementEvent.countDocuments({ status: 'Completed' });
    const totalStudents = await Student.countDocuments();
    const placedStudents = await Student.countDocuments({ isPlaced: true });

    const upcomingEvents = await PlacementEvent.find({
      driveDate: { $gte: new Date() },
      status: 'Active'
    }).sort({ driveDate: 1 }).limit(5);

    const recentlyPlaced = await Student.find({ isPlaced: true })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name placedCompany placedPackage');

    res.json({
      success: true,
      data: {
        totalEvents,
        activeEvents,
        completedEvents,
        totalStudents,
        placedStudents,
        placementRate: totalStudents > 0 ? (placedStudents / totalStudents * 100).toFixed(2) : 0,
        upcomingEvents,
        recentlyPlaced
      }
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ error: 'Server error fetching statistics' });
  }
};

module.exports = {
  createPlacementEvent,
  getPlacementEvents,
  getPlacementEvent,
  registerForEvent,
  updatePlacementEvent,
  deletePlacementEvent,
  getStatistics
};