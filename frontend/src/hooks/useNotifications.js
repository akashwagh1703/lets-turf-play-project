import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    // Simulate real-time notifications (in production, use WebSocket)
    const interval = setInterval(() => {
      // Check for new bookings, cancellations, etc.
      checkForUpdates();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [userId]);

  const checkForUpdates = async () => {
    try {
      // In production, this would be a WebSocket connection
      // For now, we'll simulate with periodic API calls
      const response = await api.getUserNotifications(userId);
      const newNotifications = response.data || [];
      
      newNotifications.forEach(notification => {
        if (!notifications.find(n => n.id === notification.id)) {
          showNotification(notification);
          setNotifications(prev => [notification, ...prev]);
        }
      });
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const showNotification = (notification) => {
    const { type, title, message } = notification;
    
    switch (type) {
      case 'booking':
        toast.success(`New Booking: ${message}`, { duration: 5000 });
        break;
      case 'cancellation':
        toast.error(`Booking Cancelled: ${message}`, { duration: 5000 });
        break;
      case 'payment':
        toast.success(`Payment Received: ${message}`, { duration: 5000 });
        break;
      default:
        toast(message, { duration: 4000 });
    }
  };

  return { notifications, showNotification };
};