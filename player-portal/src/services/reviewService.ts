import { Review } from '../types'

const mockReviews: Record<string, Review[]> = {
  '1': [
    {
      id: '1',
      userId: 'user1',
      userName: 'Rahul Sharma',
      userImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      comment: 'Excellent turf with great facilities. The lighting is perfect for evening matches.',
      date: '2025-01-10'
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Priya Patel',
      userImage: 'https://images.unsplash.com/photo-1494790108755-2616b25ad85b?w=100&h=100&fit=crop&crop=face',
      rating: 4,
      comment: 'Good surface quality and well-maintained. Parking could be better.',
      date: '2025-01-08'
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Amit Kumar',
      rating: 5,
      comment: 'Best turf in Nashik! Professional quality grass and excellent customer service.',
      date: '2025-01-05'
    }
  ],
  '2': [
    {
      id: '4',
      userId: 'user4',
      userName: 'Sneha Desai',
      userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      rating: 4,
      comment: 'Decent turf for the price. Good for casual games.',
      date: '2025-01-09'
    }
  ],
  '3': [
    {
      id: '5',
      userId: 'user5',
      userName: 'Vikram Singh',
      userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      comment: 'Premium quality turf with all amenities. Worth the price!',
      date: '2025-01-11'
    }
  ],
  '4': [
    {
      id: '6',
      userId: 'user6',
      userName: 'Anjali Mehta',
      rating: 4,
      comment: 'Good budget option. Clean facilities and friendly staff.',
      date: '2025-01-07'
    }
  ]
}

export const getReviewsByTurfId = async (turfId: string): Promise<Review[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return mockReviews[turfId] || []
}

export const addReview = async (turfId: string, review: Omit<Review, 'id' | 'date'>): Promise<Review> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const newReview: Review = {
    ...review,
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0]
  }
  
  if (!mockReviews[turfId]) {
    mockReviews[turfId] = []
  }
  
  mockReviews[turfId].unshift(newReview)
  
  return newReview
}
