import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, Clock, MapPin, MoreVertical, X, Info } from 'lucide-react'
import { getUserBookings, cancelBooking } from '../services/bookingService'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { formatCurrency, formatDate, formatTime } from '../lib/utils'
import { Booking } from '../types'
import { motion } from 'framer-motion'

export const BookingsPage: React.FC = () => {
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  
  const queryClient = useQueryClient()

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: getUserBookings
  })

  const cancelBookingMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setIsCancelModalOpen(false)
      setSelectedBooking(null)
    }
  })

  const getFilteredBookings = () => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentHour = now.getHours()

    return bookings.filter(booking => {
      switch (filter) {
        case 'upcoming':
          return (
            booking.status === 'confirmed' &&
            (booking.date > today || (booking.date === today && booking.startTime >= currentHour))
          )
        case 'past':
          return (
            booking.status === 'completed' ||
            (booking.status === 'confirmed' && (booking.date < today || (booking.date === today && booking.endTime < currentHour)))
          )
        case 'cancelled':
          return booking.status === 'cancelled'
        default:
          return true
      }
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const filteredBookings = getFilteredBookings()

  const getStatusPill = (status: string, bookingDate: string, startTime: number) => {
    let colors = ''
    let text = status.charAt(0).toUpperCase() + status.slice(1)
    
    const isPast = new Date() > new Date(`${bookingDate}T${startTime}:00`);

    if (status === 'confirmed' && isPast) {
      colors = 'bg-gray-200 text-gray-700';
      text = 'Completed';
    } else {
      switch (status) {
        case 'confirmed': colors = 'bg-primary/10 text-primary'; break;
        case 'pending': colors = 'bg-yellow-100 text-yellow-800'; break;
        case 'cancelled': colors = 'bg-destructive/10 text-destructive'; break;
        default: colors = 'bg-gray-200 text-gray-700'; break;
      }
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors}`}>
        {text}
      </span>
    )
  }

  const canCancelBooking = (booking: Booking) => {
    if (booking.status !== 'confirmed') return false
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime.toString().padStart(2, '0')}:00`)
    const timeDiff = bookingDateTime.getTime() - new Date().getTime()
    return timeDiff / (1000 * 60 * 60) >= 2 // Can cancel if more than 2 hours away
  }

  const handleCancelBooking = () => {
    if (selectedBooking) {
      cancelBookingMutation.mutate(selectedBooking.id)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/4 animate-pulse" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse h-32 bg-white" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-dark">My Bookings</h1>
          
          <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
            {[
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'past', label: 'Past' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ${
                  filter === key
                    ? 'bg-primary text-white shadow'
                    : 'text-foreground/70 hover:text-dark'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-dark mb-2">
              No {filter} bookings found
            </h3>
            <p className="text-foreground/80 mb-4">
              Time to get on the field!
            </p>
            <Button onClick={() => navigate('/search')} variant="primary">
              Book a Turf
            </Button>
          </div>
        ) : (
          <motion.div 
            className="space-y-4"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            initial="hidden"
            animate="show"
          >
            {filteredBookings.map((booking) => (
              <motion.div key={booking.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <Card className="overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-32 h-24 rounded-md overflow-hidden flex-shrink-0">
                        <img src={booking.turfImage} alt={booking.turfName} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-dark">{booking.turfName}</h3>
                            <div className="flex items-center text-foreground/80 mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-sm">{booking.turfLocation}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusPill(booking.status, booking.date, booking.startTime)}
                            {canCancelBooking(booking) && (
                              <button onClick={() => { setSelectedBooking(booking); setIsCancelModalOpen(true); }} className="text-gray-400 hover:text-dark">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="border-t my-3" />
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-foreground/90">
                          <div className="flex items-center"><Calendar className="w-4 h-4 mr-1.5 text-secondary" /><span>{formatDate(new Date(booking.date))}</span></div>
                          <div className="flex items-center"><Clock className="w-4 h-4 mr-1.5 text-secondary" /><span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span></div>
                          <div className="font-semibold text-primary">{formatCurrency(booking.totalAmount)}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Booking">
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-destructive/10 p-4 rounded-lg">
            <Info className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-destructive">Are you sure you want to cancel this booking? This action cannot be undone.</p>
          </div>
          {selectedBooking && (
            <div className="bg-muted rounded-md p-4">
              <p className="font-medium text-dark">{selectedBooking.turfName}</p>
              <p className="text-sm text-foreground/80">{formatDate(new Date(selectedBooking.date))} at {formatTime(selectedBooking.startTime)}</p>
              <p className="text-sm font-medium text-primary">{formatCurrency(selectedBooking.totalAmount)}</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)} className="flex-1">Keep Booking</Button>
            <Button onClick={handleCancelBooking} isLoading={cancelBookingMutation.isPending} variant="destructive" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
