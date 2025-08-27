import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, MapPin, Users, CreditCard } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { createBooking, confirmPayment } from '../services/bookingService'
import { addNotification } from '../services/notificationService'
import { formatCurrency, formatDate, formatTime } from '../lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const BookingPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [playerCount, setPlayerCount] = useState(10)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [bookingId, setBookingId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState('card')

  const { turf, timeSlot } = location.state || {}

  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (booking) => {
      setBookingId(booking.id)
      setIsPaymentModalOpen(true)
    }
  })

  const confirmPaymentMutation = useMutation({
    mutationFn: ({ bookingId, paymentId }: { bookingId: string; paymentId: string }) =>
      confirmPayment(bookingId, paymentId),
    onSuccess: (booking) => {
      // Add success notification
      addNotification({
        title: 'Booking Confirmed!',
        message: `Your booking at ${turf.name} for ${formatDate(new Date(timeSlot.date))} is confirmed.`,
        type: 'booking',
        isRead: false,
        actionUrl: '/bookings'
      })

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

      // Navigate to success page
      navigate('/booking-success', { state: { booking } })
    }
  })

  if (!turf || !timeSlot) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Invalid booking data</h2>
          <Button onClick={() => navigate('/search')}>Back to Search</Button>
        </div>
      </div>
    )
  }

  const handleCreateBooking = async () => {
    createBookingMutation.mutate({
      turfId: turf.id,
      turfName: turf.name,
      turfLocation: turf.location,
      turfImage: turf.images[0],
      timeSlot,
      playerCount
    })
  }

  const handlePayment = async () => {
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      await confirmPaymentMutation.mutateAsync({ bookingId, paymentId })
    } catch (error) {
      alert('Payment failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Book Your Slot</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Turf Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img
                    src={turf.images[0]}
                    alt={turf.name}
                    className="w-24 h-20 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">{turf.name}</h3>
                    <div className="flex items-center text-slate-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{turf.location}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Booking Details</h3>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-slate-500 mr-3" />
                    <div>
                      <p className="text-sm text-slate-600">Date</p>
                      <p className="font-medium">{formatDate(new Date(timeSlot.date))}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-slate-500 mr-3" />
                    <div>
                      <p className="text-sm text-slate-600">Time</p>
                      <p className="font-medium">
                        {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="w-5 h-5 text-slate-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-2">Expected Players</p>
                    <Input
                      type="number"
                      min="1"
                      max="22"
                      value={playerCount}
                      onChange={(e) => setPlayerCount(Number(e.target.value))}
                      className="w-32"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Terms & Conditions</h3>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• Booking confirmation is subject to availability</li>
                  <li>• Cancellation must be done at least 2 hours before the slot</li>
                  <li>• No refund for no-shows</li>
                  <li>• Please arrive 10 minutes before your slot time</li>
                  <li>• Follow all safety guidelines and turf rules</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <h3 className="text-lg font-semibold">Booking Summary</h3>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Slot Price</span>
                    <span className="font-medium">{formatCurrency(timeSlot.price)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-600">Duration</span>
                    <span className="font-medium">1 hour</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-600">Players</span>
                    <span className="font-medium">{playerCount}</span>
                  </div>
                  
                  <hr className="border-slate-200" />
                  
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Amount</span>
                    <span className="font-semibold text-accent-600">
                      {formatCurrency(timeSlot.price)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCreateBooking}
                  className="w-full"
                  isLoading={createBookingMutation.isPending}
                >
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Complete Payment"
        className="max-w-md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-accent-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Payment Required</h3>
            <p className="text-2xl font-bold text-accent-600">{formatCurrency(timeSlot.price)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                />
                Credit/Debit Card
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                />
                UPI
              </label>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              This is a demo environment. Payment will be simulated.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              isLoading={confirmPaymentMutation.isPending}
              className="flex-1"
            >
              Pay Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
