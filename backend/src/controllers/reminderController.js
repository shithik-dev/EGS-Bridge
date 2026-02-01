const PlacementEvent = require('../models/PlacementEvent');
const ReminderLog = require('../models/ReminderLog');
const Student = require('../models/Student');
const { sendEmailNotification } = require('../utils/emailService');

// Get all reminders for a placement event (Admin only)
const getEventReminders = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const reminders = await ReminderLog.find({ placementEvent: eventId })
      .populate('student', 'name registerNumber department email')
      .sort({ sentAt: -1 });

    const summary = await ReminderLog.aggregate([
      { $match: { placementEvent: require('mongoose').Types.ObjectId(eventId) } },
      {
        $group: {
          _id: '$reminderType',
          count: { $sum: 1 },
          students: { $addToSet: '$student' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        reminders,
        summary,
        total: reminders.length
      }
    });
  } catch (error) {
    console.error('Get event reminders error:', error);
    res.status(500).json({ error: 'Server error fetching event reminders' });
  }
};

// Get student's reminder history
const getStudentReminders = async (req, res) => {
  try {
    const reminders = await ReminderLog.find({ student: req.user._id })
      .populate('placementEvent', 'companyName jobTitle driveDate')
      .sort({ sentAt: -1 });

    res.json({
      success: true,
      data: reminders
    });
  } catch (error) {
    console.error('Get student reminders error:', error);
    res.status(500).json({ error: 'Server error fetching student reminders' });
  }
};

// Manually trigger reminders for an event (Admin only)
const triggerReminders = async (req, res) => {
  try {
    const { eventId, reminderType } = req.body;
    const event = await PlacementEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Placement event not found' });
    }

    let students = [];
    let message = '';

    switch (reminderType) {
      case 'POSTED':
        students = await Student.find({
          department: { $in: event.eligibleDepartments },
          cgpa: { $gte: event.eligibilityCriteria.minCGPA || 0 },
          isPlaced: false
        });
        message = `New placement drive: ${event.companyName}`;
        break;

      case '24_HOURS_BEFORE':
        students = await Student.find({
          department: { $in: event.eligibleDepartments },
          cgpa: { $gte: event.eligibilityCriteria.minCGPA || 0 },
          isPlaced: false,
          _id: { $nin: event.registeredStudents }
        });
        message = `24 hours left to register for ${event.companyName}`;
        break;

      case 'DEADLINE_TODAY':
        students = await Student.find({
          department: { $in: event.eligibleDepartments },
          cgpa: { $gte: event.eligibilityCriteria.minCGPA || 0 },
          isPlaced: false,
          _id: { $nin: event.registeredStudents }
        });
        message = `Last day to register for ${event.companyName}`;
        break;

      case 'DRIVE_DAY':
        students = await Student.find({
          _id: { $in: event.registeredStudents }
        });
        message = `Today is ${event.companyName} drive at ${event.driveTime}`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid reminder type' });
    }

    const reminderLogs = [];
    const emailPromises = [];

    for (const student of students) {
      // Check if already reminded
      const existingReminder = await ReminderLog.findOne({
        placementEvent: eventId,
        student: student._id,
        reminderType
      });

      if (!existingReminder) {
        const reminderLog = new ReminderLog({
          placementEvent: eventId,
          student: student._id,
          reminderType,
          sentVia: ['IN_APP']
        });

        reminderLogs.push(reminderLog.save());

        // Send email if configured
        if (process.env.EMAIL_USER) {
          emailPromises.push(
            sendEmailNotification(
              student.email,
              `Reminder: ${event.companyName}`,
              `Dear ${student.name},\n\n${message}\n\nDrive Details:\nCompany: ${event.companyName}\nPosition: ${event.jobTitle}\nDrive Date: ${event.driveDate.toLocaleDateString()}\nTime: ${event.driveTime}\n\nBest regards,\nPlacement Cell`
            ).catch(error => {
              console.error(`Failed to send email to ${student.email}:`, error);
              return { email: student.email, status: 'failed' };
            })
          );
        }
      }
    }

    await Promise.all(reminderLogs);
    const emailResults = await Promise.all(emailPromises);

    res.json({
      success: true,
      message: `Reminders triggered for ${reminderLogs.length} students`,
      data: {
        studentsNotified: reminderLogs.length,
        emailResults: emailResults.filter(r => r)
      }
    });
  } catch (error) {
    console.error('Trigger reminders error:', error);
    res.status(500).json({ error: 'Server error triggering reminders' });
  }
};

// Get reminder statistics
const getReminderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = {};

    if (startDate || endDate) {
      matchStage.sentAt = {};
      if (startDate) matchStage.sentAt.$gte = new Date(startDate);
      if (endDate) matchStage.sentAt.$lte = new Date(endDate);
    }

    const stats = await ReminderLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            type: '$reminderType',
            status: '$status'
          },
          count: { $sum: 1 },
          events: { $addToSet: '$placementEvent' }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          total: { $sum: '$count' },
          success: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'SENT'] }, '$count', 0]
            }
          },
          failed: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'FAILED'] }, '$count', 0]
            }
          },
          uniqueEvents: { $sum: { $size: '$events' } }
        }
      },
      {
        $project: {
          type: '$_id',
          total: 1,
          success: 1,
          failed: 1,
          successRate: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              { $multiply: [{ $divide: ['$success', '$total'] }, 100] }
            ]
          },
          uniqueEvents: 1
        }
      },
      { $sort: { total: -1 } }
    ]);

    const recentReminders = await ReminderLog.find(matchStage)
      .populate('placementEvent', 'companyName')
      .populate('student', 'name department')
      .sort({ sentAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        stats,
        recentReminders,
        total: await ReminderLog.countDocuments(matchStage)
      }
    });
  } catch (error) {
    console.error('Reminder stats error:', error);
    res.status(500).json({ error: 'Server error fetching reminder stats' });
  }
};

// Resend failed reminders
const resendFailedReminders = async (req, res) => {
  try {
    const failedReminders = await ReminderLog.find({
      status: 'FAILED',
      sentAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })
    .populate('student', 'email name')
    .populate('placementEvent', 'companyName jobTitle');

    const results = [];
    
    for (const reminder of failedReminders) {
      try {
        if (process.env.EMAIL_USER && reminder.student?.email) {
          await sendEmailNotification(
            reminder.student.email,
            `Reminder: ${reminder.placementEvent.companyName}`,
            `Dear ${reminder.student.name},\n\nThis is a reminder about ${reminder.placementEvent.companyName} drive.\n\nBest regards,\nPlacement Cell`
          );
          
          reminder.status = 'SENT';
          reminder.sentVia.push('EMAIL_RETRY');
          await reminder.save();
          
          results.push({
            reminderId: reminder._id,
            student: reminder.student.email,
            status: 'resend_success'
          });
        }
      } catch (error) {
        results.push({
          reminderId: reminder._id,
          student: reminder.student?.email || 'Unknown',
          status: 'resend_failed',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${failedReminders.length} failed reminders`,
      data: results
    });
  } catch (error) {
    console.error('Resend failed reminders error:', error);
    res.status(500).json({ error: 'Server error resending failed reminders' });
  }
};

module.exports = {
  getEventReminders,
  getStudentReminders,
  triggerReminders,
  getReminderStats,
  resendFailedReminders
};