export interface User {
  id: string
  name: string
  phone: string
  email?: string
  profileImage?: string
  favoriteLocation?: string
  preferredAmenities?: string[]
}

export interface Turf {
  id: string
  name: string
  location: string
  address: string
  price: number
  rating: number
  reviewCount: number
  amenities: string[]
  images: string[]
  videos?: string[]
  tags?: ('New' | 'Popular' | 'Best Value')[]
  description: string
  availability: TimeSlot[]
  latitude: number
  longitude: number
}

export interface TimeSlot {
  id: string
  date: string
  startTime: number
  endTime: number
  price: number
  isAvailable: boolean
}

export interface Booking {
  id: string
  turfId: string
  turfName: string
  turfLocation: string
  turfImage: string
  date: string
  startTime: number
  endTime: number
  totalAmount: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  paymentId: string
  bookingDate: string
  playerCount?: number
}

export interface Review {
  id: string
  userId: string
  userName: string
  userImage?: string
  rating: number
  comment: string
  date: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'booking' | 'reminder' | 'promotion'
  isRead: boolean
  date: string
  actionUrl?: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
}

export interface SearchFilters {
  location?: string
  minPrice?: number
  maxPrice?: number
  amenities?: string[]
  rating?: number
  sortBy?: 'nearest' | 'cheapest' | 'rating'
  latitude?: number
  longitude?: number
}
