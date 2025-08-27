import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { MapPin, Star, Clock, Users, ArrowLeft, Calendar, IndianRupee, Image as ImageIcon, Video } from 'lucide-react'
import { getTurfById, getTurfAvailability } from '../services/turfService'
import { getReviewsByTurfId } from '../services/reviewService'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { formatCurrency, formatDate, formatTime } from '../lib/utils'
import { AmenityIcon } from '../components/ui/AmenityIcon'

export const TurfDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')

  const { data: turf, isLoading: turfLoading } = useQuery({
    queryKey: ['turf', id],
    queryFn: () => getTurfById(id!),
    enabled: !!id
  })

  const { data: availability = [], isLoading: availabilityLoading } = useQuery({
    queryKey: ['turf-availability', id, selectedDate],
    queryFn: () => getTurfAvailability(id!, selectedDate),
    enabled: !!id && !!selectedDate
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['turf-reviews', id],
    queryFn: () => getReviewsByTurfId(id!),
    enabled: !!id
  })

  if (turfLoading) {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/4" />
          <div className="h-64 bg-gray-200 rounded-lg mb-6" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!turf) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-secondary mb-2">Turf not found</h2>
          <Button onClick={() => navigate('/search')}>Back to Search</Button>
        </div>
      </div>
    )
  }

  const availableSlots = availability.filter(slot => slot.isAvailable)
  const nextWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date.toISOString().split('T')[0]
  })

  const handleBookSlot = (slotId: string) => {
    const slot = availability.find(s => s.id === slotId)
    if (slot) {
      navigate('/booking', {
        state: {
          turf,
          timeSlot: slot
        }
      })
    }
  }
  
  const currentMedia = mediaType === 'image' ? turf.images : turf.videos || []

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 text-gray-600 hover:text-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-secondary">Turf Details</h1>
        </div>

        {/* Media Gallery */}
        <div className="mb-8">
          <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-black">
            {currentMedia.length > 0 && (
              mediaType === 'image' ? (
                <img
                  src={currentMedia[selectedMediaIndex]}
                  alt={turf.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={currentMedia[selectedMediaIndex]}
                  controls
                  autoPlay
                  muted
                  loop
                  className="w-full h-full object-cover"
                />
              )
            )}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-2 overflow-x-auto">
              {currentMedia.map((mediaUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMediaIndex(index)}
                  className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    selectedMediaIndex === index ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  {mediaType === 'image' ? (
                    <img
                      src={mediaUrl}
                      alt={`${turf.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={mediaType === 'image' ? 'primary' : 'outline'} onClick={() => { setMediaType('image'); setSelectedMediaIndex(0); }}>
                <ImageIcon size={16} />
              </Button>
              {turf.videos && turf.videos.length > 0 && (
                <Button size="sm" variant={mediaType === 'video' ? 'primary' : 'outline'} onClick={() => { setMediaType('video'); setSelectedMediaIndex(0); }}>
                  <Video size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-secondary mb-2">{turf.name}</h2>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{turf.address}</span>
                </div>

                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-accent fill-accent mr-1" />
                    <span className="font-medium">{turf.rating}</span>
                    <span className="text-gray-500 ml-1">({turf.reviewCount} reviews)</span>
                  </div>
                  
                  <div className="flex items-center text-primary font-semibold">
                    <IndianRupee className="w-5 h-5 mr-1" />
                    {turf.price}/hour
                  </div>
                </div>

                <p className="text-foreground">{turf.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Amenities</h3>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {turf.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <AmenityIcon amenity={amenity} className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Reviews ({reviews.length})</h3>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-start gap-3">
                          {review.userImage ? (
                            <img
                              src={review.userImage}
                              alt={review.userName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-secondary">{review.userName}</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'text-accent fill-accent'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{formatDate(new Date(review.date))}</span>
                            </div>
                            <p className="text-foreground text-sm">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {reviews.length > 3 && (
                      <button className="text-primary hover:text-primary/80 font-medium text-sm">
                        View all reviews
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book a Slot
                </h3>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {/* Date Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    {nextWeek.map((date) => (
                      <option key={date} value={date}>
                        {formatDate(new Date(date))}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Available Slots</label>
                  {availabilityLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleBookSlot(slot.id)}
                          className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md hover:border-primary hover:bg-primary/10 transition-colors text-left"
                        >
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                          </div>
                          <span className="font-medium text-primary">
                            {formatCurrency(slot.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No available slots for this date</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
