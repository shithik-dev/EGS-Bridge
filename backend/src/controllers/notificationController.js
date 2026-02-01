const Notification = require('../models/Notification');
const Student = require('../models/Student');

// Get all notifications for current user
const getNotifications = async (req, res) => {
  try {
    const { limit = 50, read } = req.query;
    const filter = { student: req.user._id };

    if (read !== undefined) {
      filter.isRead = read === 'true';
    }

    const notifications = await Notification.find(filter)
      .populate('placementEvent', 'companyName jobTitle')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      student: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        total: notifications.length
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        student: req.user._id
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Server error marking notification as read' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { student: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Server error marking all notifications as read' });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      student: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Remove notification from student's notifications array
    await Student.findByIdAndUpdate(
      req.user._id,
      { $pull: { notifications: notification._id } }
    );

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Server error deleting notification' });
  }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const stats = await Notification.aggregate([
      {
        $match: {
          student: req.user._id,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            read: '$isRead'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const todayNotifications = await Notification.countDocuments({
      student: req.user._id,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const urgentNotifications = await Notification.countDocuments({
      student: req.user._id,
      priority: 'URGENT',
      isRead: false
    });

    res.json({
      success: true,
      data: {
        stats,
        todayCount: todayNotifications,
        urgentCount: urgentNotifications,
        total: await Notification.countDocuments({ student: req.user._id })
      }
    });
  } catch (error) {
    console.error('Notification stats error:', error);
    res.status(500).json({ error: 'Server error fetching notification stats' });
  }
};

// Create manual notification (Admin only)
const createNotification = async (req, res) => {
  try {
    const { studentId, title, message, type = 'STATUS_UPDATE', priority = 'MEDIUM' } = req.body;

    if (!studentId || !title || !message) {
      return res.status(400).json({ error: 'Student ID, title and message are required' });
    }

    const notification = new Notification({
      student: studentId,
      title,
      message,
      type,
      priority,
      sentVia: ['IN_APP']
    });

    await notification.save();

    // Add to student's notifications
    await Student.findByIdAndUpdate(studentId, {
      $push: { notifications: notification._id }
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Server error creating notification' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  createNotification
};