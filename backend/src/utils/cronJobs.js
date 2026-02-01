const cron = require('node-cron');
const PlacementEvent = require('../models/PlacementEvent');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const ReminderLog = require('../models/ReminderLog');
const { sendEmailNotification } = require('./emailService');

// Run every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Running daily reminder cron job...');
  
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find events with registration deadline tomorrow
    const eventsWithDeadlineTomorrow = await PlacementEvent.find({
      registrationDeadline: {
        $gte: tomorrow.setHours(0, 0, 0, 0),
        $lt: tomorrow.setHours(23, 59, 59, 999)
      },
      status: 'Active'
    });

    // Send 24-hour reminders
    for (const event of eventsWithDeadlineTomorrow) {
      await send24HourReminders(event);
    }

    // Find events with deadline today
    const eventsWithDeadlineToday = await PlacementEvent.find({
      registrationDeadline: {
        $gte: today.setHours(0, 0, 0, 0),
        $lt: today.setHours(23, 59, 59, 999)
      },
      status: 'Active'
    });

    // Send deadline today reminders
    for (const event of eventsWithDeadlineToday) {
      await sendDeadlineTodayReminders(event);
    }

    // Find events happening today
    const eventsToday = await PlacementEvent.find({
      driveDate: {
        $gte: today.setHours(0, 0, 0, 0),
        $lt: today.setHours(23, 59, 59, 999)
      },
      status: 'Active'
    });

    // Send drive day reminders
    for (const event of eventsToday) {
      await sendDriveDayReminders(event);
    }

    console.log('✅ Daily reminders sent successfully');
  } catch (error) {
    console.error('❌ Error in cron job:', error);
  }
});

// Send 24-hour before deadline reminders
async function send24HourReminders(event) {
  try {
    const eligibleStudents = await getEligibleStudents(event);

    for (const student of eligibleStudents) {
      // Check if already reminded
      const existingReminder = await ReminderLog.findOne({
        placementEvent: event._id,
        student: student._id,
        reminderType: '24_HOURS_BEFORE'
      });

      if (!existingReminder) {
        // Create notification
        const notification = new Notification({
          student: student._id,
          placementEvent: event._id,
          type: 'DEADLINE_REMINDER',
          title: `⏰ Deadline Tomorrow: ${event.companyName}`,
          message: `Registration for ${event.companyName} closes tomorrow! Don't miss this opportunity.`,
          priority: 'URGENT'
        });

        await notification.save();

        // Add to student's notifications
        await Student.findByIdAndUpdate(student._id, {
          $push: { notifications: notification._id }
        });

        // Send email
        try {
          await sendEmailNotification(
            student.email,
            `Last Day to Register: ${event.companyName}`,
            `Dear ${student.name},\n\nThis is a reminder that registration for ${event.companyName} closes tomorrow.\n\nDrive Details:\nCompany: ${event.companyName}\nPosition: ${event.jobTitle}\nRegistration Link: ${event.registrationLink}\n\nBest regards,\nPlacement Cell`
          );
        } catch (emailError) {
          console.error('Email send failed:', emailError);
        }

        // Log reminder
        await ReminderLog.create({
          placementEvent: event._id,
          student: student._id,
          reminderType: '24_HOURS_BEFORE',
          sentVia: ['IN_APP', 'EMAIL']
        });
      }
    }
  } catch (error) {
    console.error('Error in 24-hour reminders:', error);
  }
}

// Send deadline today reminders
async function sendDeadlineTodayReminders(event) {
  try {
    const eligibleStudents = await getEligibleStudents(event);

    for (const student of eligibleStudents) {
      const existingReminder = await ReminderLog.findOne({
        placementEvent: event._id,
        student: student._id,
        reminderType: 'DEADLINE_TODAY'
      });

      if (!existingReminder) {
        const notification = new Notification({
          student: student._id,
          placementEvent: event._id,
          type: 'DEADLINE_REMINDER',
          title: `⚠️ Deadline Today: ${event.companyName}`,
          message: `Today is the last day to register for ${event.companyName}! Register now.`,
          priority: 'URGENT'
        });

        await notification.save();

        await Student.findByIdAndUpdate(student._id, {
          $push: { notifications: notification._id }
        });

        // Log reminder
        await ReminderLog.create({
          placementEvent: event._id,
          student: student._id,
          reminderType: 'DEADLINE_TODAY',
          sentVia: ['IN_APP']
        });
      }
    }
  } catch (error) {
    console.error('Error in deadline today reminders:', error);
  }
}

// Send drive day reminders
async function sendDriveDayReminders(event) {
  try {
    const registeredStudents = await Student.find({
      _id: { $in: event.registeredStudents }
    });

    for (const student of registeredStudents) {
      const existingReminder = await ReminderLog.findOne({
        placementEvent: event._id,
        student: student._id,
        reminderType: 'DRIVE_DAY'
      });

      if (!existingReminder) {
        const notification = new Notification({
          student: student._id,
          placementEvent: event._id,
          type: 'DRIVE_DAY',
          title: `🎯 Drive Today: ${event.companyName}`,
          message: `Today is your ${event.companyName} drive at ${event.driveTime}. Mode: ${event.mode}. ${event.mode === 'Offline' ? `Venue: ${event.venue}` : 'Check your email for online link'}`,
          priority: 'HIGH'
        });

        await notification.save();

        await Student.findByIdAndUpdate(student._id, {
          $push: { notifications: notification._id }
        });

        // Send email
        try {
          await sendEmailNotification(
            student.email,
            `Drive Today: ${event.companyName}`,
            `Dear ${student.name},\n\nYour ${event.companyName} placement drive is scheduled for today at ${event.driveTime}.\n\nMode: ${event.mode}\n${event.mode === 'Offline' ? `Venue: ${event.venue}` : 'The online link will be shared 30 minutes before the drive'}\n\nAll the best!\nPlacement Cell`
          );
        } catch (emailError) {
          console.error('Email send failed:', emailError);
        }

        // Log reminder
        await ReminderLog.create({
          placementEvent: event._id,
          student: student._id,
          reminderType: 'DRIVE_DAY',
          sentVia: ['IN_APP', 'EMAIL']
        });
      }
    }
  } catch (error) {
    console.error('Error in drive day reminders:', error);
  }
}

// Helper function to get eligible students
async function getEligibleStudents(event) {
  return await Student.find({
    department: { $in: event.eligibleDepartments },
    cgpa: { $gte: event.eligibilityCriteria.minCGPA || 0 },
    isPlaced: false,
    _id: { $nin: event.registeredStudents }
  });
}

module.exports = { initializeCronJobs: () => console.log('Cron jobs initialized') };