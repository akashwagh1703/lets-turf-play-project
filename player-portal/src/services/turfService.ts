import { Turf, SearchFilters, TimeSlot } from '../types'

// Haversine formula to calculate distance between two lat/lon points
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371 // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

function generateTimeSlots(turfId: string, price: number): TimeSlot[] {
  const slots: TimeSlot[] = []
  const today = new Date()
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(today)
    date.setDate(today.getDate() + day)
    const dateStr = date.toISOString().split('T')[0]
    
    for (let hour = 6; hour <= 21; hour++) {
      const isAvailable = Math.random() > 0.3
      slots.push({
        id: `${turfId}-${dateStr}-${hour}`,
        date: dateStr,
        startTime: hour,
        endTime: hour + 1,
        price: price,
        isAvailable
      })
    }
  }
  
  return slots
}

const mockTurfs: Turf[] = [
  {
    id: '1',
    name: 'Omkara Football Turf',
    location: 'Nashik Road',
    address: 'Siddhivinayak Society, Nashik Road, Nashik 422101',
    price: 1200,
    rating: 4.5,
    reviewCount: 128,
    amenities: ['Floodlights', 'Parking', 'Washroom', 'Drinking Water', 'First Aid'],
    images: [
      'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=600',
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600'
    ],
    videos: [
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
    ],
    tags: ['Popular'],
    description: 'Premium football turf with artificial grass and professional lighting. Perfect for matches and training sessions.',
    availability: generateTimeSlots('1', 1200),
    latitude: 19.9615,
    longitude: 73.7909
  },
  {
    id: '2',
    name: 'TDK Sports Complex',
    location: 'College Road',
    address: 'Near Engineering College, College Road, Nashik 422005',
    price: 1000,
    rating: 4.2,
    reviewCount: 89,
    amenities: ['Floodlights', 'Washroom', 'Seating Area', 'Equipment Rental'],
    images: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600'
    ],
    tags: ['Best Value'],
    description: 'Well-maintained turf with modern facilities. Ideal for both casual games and competitive matches.',
    availability: generateTimeSlots('2', 1000),
    latitude: 19.9974,
    longitude: 73.7821
  },
  {
    id: '3',
    name: 'Goal Masters Arena',
    location: 'Panchavati',
    address: 'Panchavati Circle, Nashik 422003',
    price: 1500,
    rating: 4.7,
    reviewCount: 201,
    amenities: ['Floodlights', 'Parking', 'Washroom', 'Cafeteria', 'Changing Room', 'Equipment Rental'],
    images: [
      'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&h=600',
      'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=600'
    ],
    videos: [
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    ],
    tags: ['Popular', 'New'],
    description: 'Premium sports facility with top-notch infrastructure. Features include professional-grade turf and complete amenities.',
    availability: generateTimeSlots('3', 1500),
    latitude: 20.0059,
    longitude: 73.7903
  },
  {
    id: '4',
    name: 'Champion Turf',
    location: 'Adgaon',
    address: 'MIDC Area, Adgaon, Nashik 422011',
    price: 800,
    rating: 4.0,
    reviewCount: 67,
    amenities: ['Floodlights', 'Parking', 'Washroom'],
    images: [
      'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=600'
    ],
    tags: ['Best Value'],
    description: 'Affordable turf with basic amenities. Great for regular practice sessions and friendly matches.',
    availability: generateTimeSlots('4', 800),
    latitude: 20.0210,
    longitude: 73.8325
  }
]

export const getTurfs = async (filters?: SearchFilters): Promise<Turf[]> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  let filteredTurfs = [...mockTurfs]
  
  if (filters) {
    if (filters.location) {
      filteredTurfs = filteredTurfs.filter(turf => 
        turf.location.toLowerCase().includes(filters.location!.toLowerCase()) ||
        turf.address.toLowerCase().includes(filters.location!.toLowerCase())
      )
    }
    
    if (filters.minPrice !== undefined) {
      filteredTurfs = filteredTurfs.filter(turf => turf.price >= filters.minPrice!)
    }
    if (filters.maxPrice !== undefined) {
      filteredTurfs = filteredTurfs.filter(turf => turf.price <= filters.maxPrice!)
    }
    
    if (filters.rating !== undefined) {
      filteredTurfs = filteredTurfs.filter(turf => turf.rating >= filters.rating!)
    }
    
    if (filters.amenities && filters.amenities.length > 0) {
      filteredTurfs = filteredTurfs.filter(turf =>
        filters.amenities!.every(amenity => turf.amenities.includes(amenity))
      )
    }
    
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'cheapest':
          filteredTurfs.sort((a, b) => a.price - b.price)
          break
        case 'rating':
          filteredTurfs.sort((a, b) => b.rating - a.rating)
          break
        case 'nearest':
          if (filters.latitude && filters.longitude) {
            filteredTurfs.sort((a, b) => {
              const distA = getDistance(filters.latitude!, filters.longitude!, a.latitude!, a.longitude!)
              const distB = getDistance(filters.latitude!, filters.longitude!, b.latitude!, b.longitude!)
              return distA - distB
            })
          } else {
            // Fallback for 'nearest' if no location provided
            filteredTurfs.sort(() => Math.random() - 0.5)
          }
          break
      }
    }
  }
  
  return filteredTurfs
}

export const getTurfById = async (id: string): Promise<Turf | null> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockTurfs.find(turf => turf.id === id) || null
}

export const getTurfAvailability = async (turfId: string, date: string): Promise<TimeSlot[]> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  const turf = mockTurfs.find(t => t.id === turfId)
  if (!turf) return []
  return turf.availability.filter(slot => slot.date === date)
}

export const getAllAmenities = (): string[] => {
  const amenities = new Set<string>()
  mockTurfs.forEach(turf => {
    turf.amenities.forEach(amenity => amenities.add(amenity))
  })
  return Array.from(amenities).sort()
}
