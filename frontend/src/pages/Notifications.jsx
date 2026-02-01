import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Loader, { SkeletonLoader } from '../components/Common/Loader';
import {
  FaBell,
  FaCheck,
  FaTrash,
  FaFilter,
  FaEnvelope,
  FaExclamationTriangle,
  FaCalendarCheck,
  FaCheckCircle,
  FaTimes
} from 'react-icons/fa';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, refreshNotifications } = useNotification();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [loading, setLoading] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Group notifications by date
  const groupNotificationsByDate = () => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    notifications.forEach(notification => {
      const notificationDate = new Date(notification.createdAt);
      
      if (isToday(notificationDate)) {
        groups.today.push(notification);
      } else if (isYesterday(notificationDate)) {
        groups.yesterday.push(notification);
      } else if (notificationDate > oneWeekAgo) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  const filteredNotifications = () => {
    let filtered = [...notifications];
    
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }
    
    return filtered;
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications().length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications().map(n => n._id));
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleMarkSelectedAsRead = async () => {
    try {
      const promises = selectedNotifications.map(id => markAsRead(id));
      await Promise.all(promises);
      setSelectedNotifications([]);
      toast.success('Selected notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const promises = selectedNotifications.map(id => deleteNotification(id));
      await Promise.all(promises);
      setSelectedNotifications([]);
      setShowDeleteConfirm(false);
      toast.success('Selected notifications deleted');
    } catch (error) {
      toast.error('Failed to delete notifications');
    }
  };

  const handleClearAll = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'JOB_POSTED':
        return <FaBell className="text-blue-500" />;
      case 'DEADLINE_REMINDER':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'DRIVE_DAY':
        return <FaCalendarCheck className="text-green-500" />;
      case 'STATUS_UPDATE':
        return <FaCheckCircle className="text-purple-500" />;
      default:
        return <FaEnvelope className="text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'JOB_POSTED':
        return 'New Drive';
      case 'DEADLINE_REMINDER':
        return 'Reminder';
      case 'DRIVE_DAY':
        return 'Drive Today';
      case 'STATUS_UPDATE':
        return 'Status Update';
      default:
        return 'Notification';
    }
  };

  const groups = groupNotificationsByDate();
  const displayNotifications = filteredNotifications();

  if (loading) {
    return <SkeletonLoader type="list" count={5} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Notifications
          </h1>
          <p className="text-gray-600">
            {unreadCount} unread • {notifications.length} total
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedNotifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedNotifications.length} selected
              </span>
              <button
                onClick={handleMarkSelectedAsRead}
                className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100"
              >
                Mark as Read
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
              disabled={unreadCount === 0}
            >
              Mark All Read
            </button>
            <button
              onClick={refreshNotifications}
              className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'unread'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'read'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-8">
        {displayNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <FaBell className="text-gray-300 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No notifications
            </h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? 'You have no unread notifications'
                : 'You have no notifications yet'}
            </p>
          </div>
        ) : (
          <>
            {/* Today */}
            {groups.today.length > 0 && displayNotifications.some(n => isToday(new Date(n.createdAt))) && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Today</h2>
                <div className="space-y-3">
                  {displayNotifications
                    .filter(n => isToday(new Date(n.createdAt)))
                    .map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        isSelected={selectedNotifications.includes(notification._id)}
                        onSelect={handleSelectNotification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                        getIcon={getNotificationIcon}
                        getTypeLabel={getNotificationTypeLabel}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Yesterday */}
            {groups.yesterday.length > 0 && displayNotifications.some(n => isYesterday(new Date(n.createdAt))) && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Yesterday</h2>
                <div className="space-y-3">
                  {displayNotifications
                    .filter(n => isYesterday(new Date(n.createdAt)))
                    .map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        isSelected={selectedNotifications.includes(notification._id)}
                        onSelect={handleSelectNotification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                        getIcon={getNotificationIcon}
                        getTypeLabel={getNotificationTypeLabel}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* This Week */}
            {groups.thisWeek.length > 0 && displayNotifications.some(n => {
              const date = new Date(n.createdAt);
              return !isToday(date) && !isYesterday(date) && date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            }) && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">This Week</h2>
                <div className="space-y-3">
                  {displayNotifications
                    .filter(n => {
                      const date = new Date(n.createdAt);
                      return !isToday(date) && !isYesterday(date) && date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    })
                    .map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        isSelected={selectedNotifications.includes(notification._id)}
                        onSelect={handleSelectNotification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                        getIcon={getNotificationIcon}
                        getTypeLabel={getNotificationTypeLabel}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Older */}
            {groups.older.length > 0 && displayNotifications.some(n => {
              const date = new Date(n.createdAt);
              return date <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            }) && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Older</h2>
                <div className="space-y-3">
                  {displayNotifications
                    .filter(n => new Date(n.createdAt) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                    .map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        isSelected={selectedNotifications.includes(notification._id)}
                        onSelect={handleSelectNotification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                        getIcon={getNotificationIcon}
                        getTypeLabel={getNotificationTypeLabel}
                      />
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk Select Checkbox */}
      {displayNotifications.length > 0 && (
        <div className="sticky bottom-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedNotifications.length === displayNotifications.length}
                onChange={handleSelectAll}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Select all {displayNotifications.length} notifications
              </label>
            </div>
            <div className="flex items-center space-x-3">
              {selectedNotifications.length > 0 && (
                <>
                  <button
                    onClick={handleMarkSelectedAsRead}
                    className="flex items-center text-sm text-green-600 hover:text-green-700"
                  >
                    <FaCheck className="mr-1" />
                    Mark as read
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center text-sm text-red-600 hover:text-red-700"
                  >
                    <FaTrash className="mr-1" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Delete Notifications
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedNotifications.length} notification(s)? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Notification Item Component
const NotificationItem = ({ 
  notification, 
  isSelected, 
  onSelect, 
  onMarkAsRead, 
  onDelete,
  getIcon,
  getTypeLabel 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative p-4 bg-white rounded-xl border transition-all ${
        notification.isRead
          ? 'border-gray-200 hover:border-gray-300'
          : 'border-blue-200 bg-blue-50 hover:border-blue-300'
      } ${isHovered ? 'shadow-sm' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(notification._id)}
          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />

        {/* Icon */}
        <div className="ml-3 mr-4 mt-1">
          <div className={`p-2 rounded-lg ${
            notification.isRead ? 'bg-gray-100' : 'bg-blue-100'
          }`}>
            {getIcon(notification.type)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`font-medium ${
                notification.isRead ? 'text-gray-800' : 'text-gray-900'
              }`}>
                {notification.title}
              </h3>
              <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                notification.priority === 'URGENT'
                  ? 'bg-red-100 text-red-800'
                  : notification.priority === 'HIGH'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {getTypeLabel(notification.type)}
              </span>
            </div>
            <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </div>
          </div>
          
          <p className="text-gray-600 mt-2 text-sm">
            {notification.message}
          </p>
          
          {notification.placementEvent && (
            <div className="mt-2 text-xs text-gray-500">
              Related to: {notification.placementEvent.companyName}
            </div>
          )}

          {/* Actions (shown on hover) */}
          {isHovered && (
            <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-gray-200">
              {!notification.isRead && (
                <button
                  onClick={() => onMarkAsRead(notification._id)}
                  className="flex items-center text-xs text-green-600 hover:text-green-700"
                >
                  <FaCheck className="mr-1" />
                  Mark as read
                </button>
              )}
              <button
                onClick={() => onDelete(notification._id)}
                className="flex items-center text-xs text-red-600 hover:text-red-700"
              >
                <FaTrash className="mr-1" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}
    </div>
  );
};

export default Notifications;