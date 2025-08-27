import { Notification } from '../types'

const STORAGE_KEY = 'turfbooker_notifications'

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Booking Confirmed',
    message: 'Your booking at Omkara Football Turf for Jan 15, 6:00 PM is confirmed.',
    type: 'booking',
    isRead: false,
    date: '2025-01-12T10:30:00Z',
    actionUrl: '/bookings'
  },
  {
    id: '2',
    title: 'Match Reminder',
    message: 'Your match at Goal Masters Arena starts in 2 hours. Good luck!',
    type: 'reminder',
    isRead: false,
    date: '2025-01-11T18:00:00Z'
  },
  {
    id: '3',
    title: 'Special Offer',
    message: '20% off on weekend bookings! Use code WEEKEND20',
    type: 'promotion',
    isRead: true,
    date: '2025-01-10T09:00:00Z'
  }
]

export const getNotifications = async (): Promise<Notification[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400))
  
  const stored = getStoredNotifications()
  return stored.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const markAsRead = async (notificationId: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200))
  
  const notifications = getStoredNotifications()
  const index = notifications.findIndex(n => n.id === notificationId)
  
  if (index !== -1) {
    notifications[index].isRead = true
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  }
}

export const markAllAsRead = async (): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const notifications = getStoredNotifications()
  notifications.forEach(n => n.isRead = true)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
}

export const getUnreadCount = async (): Promise<number> => {
  const notifications = await getNotifications()
  return notifications.filter(n => !n.isRead).length
}

export const addNotification = (notification: Omit<Notification, 'id' | 'date'>): void => {
  const notifications = getStoredNotifications()
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    date: new Date().toISOString()
  }
  
  notifications.unshift(newNotification)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
}

const getStoredNotifications = (): Notification[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    // Initialize with mock data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockNotifications))
    return mockNotifications
  } catch {
    return mockNotifications
  }
}
