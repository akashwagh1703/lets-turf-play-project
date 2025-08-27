import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, Calendar, Clock, MapPin, Home, Eye } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { formatCurrency, formatDate, formatTime } from '../lib/utils'

export const BookingSuccessPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const { booking } = location.state || {}

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Booking data not found</h2>
          <Button onClick={() => navigate('/search')}>Back to Search</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-accent-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
            <p className="text-slate-600 mb-8">Your turf has been successfully booked</p>
            
            {/* Booking Details */}
            <div className="bg-slate-100 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-slate-900 mb-4">Booking Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-slate-500 mr-3" />
                  <div>
                    <p className="font-medium">{booking.turfName}</p>
                    <p className="text-sm text-slate-600">{booking.turfLocation}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-slate-500 mr-3" />
                  <div>
                    <p className="font-medium">{formatDate(new Date(booking.date))}</p>
                    <p className="text-sm text-slate-600">Date</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-slate-500 mr-3" />
                  <div>
                    <p className="font-medium">
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </p>
                    <p className="text-sm text-slate-600">Time Slot</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Paid</span>
                  <span className="font-bold text-accent-600">
                    {formatCurrency(booking.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/bookings')}
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                View My Bookings
              </Button>
              
              <Button
                onClick={() => navigate('/search')}
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
            
            <div className="mt-6 text-sm text-slate-500">
              <p>Booking ID: {booking.id}</p>
              <p>You will receive a confirmation notification</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
