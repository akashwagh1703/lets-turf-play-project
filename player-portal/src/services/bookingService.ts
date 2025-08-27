import { Booking, TimeSlot } from '../types'

const STORAGE_KEY = 'turfbooker_bookings'

const mockBookings: Booking[] = [
  {
    id: 'booking1',
    turfId: '1',
    turfName: 'Omkara Football Turf',
    turfLocation: 'Nashik Road',
    turfImage: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=300',
    date: '2025-01-15',
    startTime: 18,
    endTime: 19,
    totalAmount: 1200,
    status: 'confirmed',
    paymentId: 'pay_123456',
    bookingDate: '2025-01-12',
    playerCount: 10
  },
  {
    id: 'booking2',
    turfId: '3',
    turfName: 'Goal Masters Arena',
    turfLocation: 'Panchavati',
    turfImage: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=400&h=300',
    date: '2025-01-20',
    startTime: 20,
    endTime: 21,
    totalAmount: 1500,
    status: 'confirmed',
    paymentId: 'pay_789012',
    bookingDate: '2025-01-10',
    playerCount: 12
  }
]

export const createBooking = async (bookingData: {
  turfId: string
  turfName: string
  turfLocation: string
  turfImage: string
  timeSlot: TimeSlot
  playerCount?: number
}): Promise<Booking> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const booking: Booking = {
    id: `booking_${Date.now()}`,
    turfId: bookingData.turfId,
    turfName: bookingData.turfName,
    turfLocation: bookingData.turfLocation,
    turfImage: bookingData.turfImage,
    date: bookingData.timeSlot.date,
    startTime: bookingData.timeSlot.startTime,
    endTime: bookingData.timeSlot.endTime,
    totalAmount: bookingData.timeSlot.price,
    status: 'pending',
    paymentId: '',
    bookingDate: new Date().toISOString().split('T')[0],
    playerCount: bookingData.playerCount
  }
  
  // Store booking
  const bookings = getStoredBookings()
  bookings.unshift(booking)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
  
  return booking
}

export const confirmPayment = async (bookingId: string, paymentId: string): Promise<Booking> => {
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const bookings = getStoredBookings()
  const bookingIndex = bookings.findIndex(b => b.id === bookingId)
  
  if (bookingIndex === -1) {
    throw new Error('Booking not found')
  }
  
  // Simulate payment success/failure (90% success rate)
  const isPaymentSuccessful = Math.random() > 0.1
  
  if (!isPaymentSuccessful) {
    throw new Error('Payment failed. Please try again.')
  }
  
  bookings[bookingIndex] = {
    ...bookings[bookingIndex],
    status: 'confirmed',
    paymentId
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
  
  return bookings[bookingIndex]
}

export const getUserBookings = async (): Promise<Booking[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600))
  
  return getStoredBookings()
}

export const cancelBooking = async (bookingId: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const bookings = getStoredBookings()
  const bookingIndex = bookings.findIndex(b => b.id === bookingId)
  
  if (bookingIndex === -1) {
    throw new Error('Booking not found')
  }
  
  bookings[bookingIndex] = {
    ...bookings[bookingIndex],
    status: 'cancelled'
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
}

const getStoredBookings = (): Booking[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    // Return mock bookings if no stored data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockBookings))
    return mockBookings
  } catch {
    return mockBookings
  }
}
