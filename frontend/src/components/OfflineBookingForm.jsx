import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, User, Phone, Mail, CreditCard, FileText, X, Check } from 'lucide-react';
import { apiService } from '../services/api';

const OfflineBookingForm = ({ isOpen, onClose, turfs = [] }) => {
  const [formData, setFormData] = useState({
    turf_id: '',
    booking_plan: 'single',
    date: '',
    start_time: '',
    end_time: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    amount: '',
    advance_amount: '',
    plan_duration: 1,
    recurring_days: [],
    notes: ''
  });
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const bookingPlans = [
    { value: 'single', label: 'Single Day', description: 'One-time booking' },
    { value: 'daily', label: 'Daily Plan', description: 'Consecutive days' },
    { value: 'weekly', label: 'Weekly Plan', description: 'Specific days each week' },
    { value: 'monthly', label: 'Monthly Plan', description: 'Full month access' }
  ];

  const weekDays = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' }
  ];

  useEffect(() => {
    if (formData.turf_id && formData.date) {
      fetchAvailableSlots();
    }
  }, [formData.turf_id, formData.date]);

  const fetchAvailableSlots = async () => {
    try {
      setSlotsLoading(true);
      const response = await apiService.get(`/turfs/${formData.turf_id}/available-slots?date=${formData.date}`);
      setAvailableSlots(response.data.slots || []);
    } catch (error) {
      toast.error('Failed to fetch available slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate remaining amount
    if (field === 'amount' || field === 'advance_amount') {
      const amount = field === 'amount' ? parseFloat(value) || 0 : parseFloat(formData.amount) || 0;
      const advance = field === 'advance_amount' ? parseFloat(value) || 0 : parseFloat(formData.advance_amount) || 0;
      setFormData(prev => ({ ...prev, remaining_amount: Math.max(0, amount - advance) }));
    }
  };

  const handleRecurringDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      recurring_days: prev.recurring_days.includes(day)
        ? prev.recurring_days.filter(d => d !== day)
        : [...prev.recurring_days, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiService.post('/bookings', {
        ...formData,
        booking_type: 'offline'
      });
      
      toast.success('Offline booking created successfully!');
      onClose();
      setFormData({
        turf_id: '',
        booking_plan: 'single',
        date: '',
        start_time: '',
        end_time: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        amount: '',
        advance_amount: '',
        plan_duration: 1,
        recurring_days: [],
        notes: ''
      });
      // Refresh parent component data if callback provided
      if (window.location.pathname.includes('bookings')) {
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Offline Booking</h2>
              <p className="text-gray-600 text-sm">Create a new booking for walk-in customers</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Turf Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Select Turf
                </label>
                <select
                  value={formData.turf_id}
                  onChange={(e) => handleInputChange('turf_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a turf</option>
                  {turfs.map(turf => (
                    <option key={turf.id} value={turf.id}>
                      {turf.turf_name} - {turf.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Booking Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Booking Plan</label>
                <div className="grid grid-cols-2 gap-3">
                  {bookingPlans.map(plan => (
                    <button
                      key={plan.value}
                      type="button"
                      onClick={() => handleInputChange('booking_plan', plan.value)}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        formData.booking_plan === plan.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{plan.label}</div>
                      <div className="text-xs text-gray-500">{plan.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {formData.booking_plan !== 'single' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration ({formData.booking_plan === 'daily' ? 'days' : formData.booking_plan === 'weekly' ? 'weeks' : 'months'})
                    </label>
                    <input
                      type="number"
                      value={formData.plan_duration}
                      onChange={(e) => handleInputChange('plan_duration', parseInt(e.target.value))}
                      min="1"
                      max={formData.booking_plan === 'daily' ? '30' : formData.booking_plan === 'weekly' ? '12' : '6'}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Weekly Recurring Days */}
              {formData.booking_plan === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Days</label>
                  <div className="flex space-x-2">
                    {weekDays.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleRecurringDayToggle(day.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.recurring_days.includes(day.value)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Customer Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => handleInputChange('customer_email', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="customer@email.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Available Time Slots
                </label>
                
                {slotsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 text-sm mt-2">Loading slots...</p>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => {
                          handleInputChange('start_time', slot.start_time);
                          handleInputChange('end_time', slot.end_time);
                        }}
                        className={`p-3 rounded-lg text-sm font-medium transition-all ${
                          formData.start_time === slot.start_time
                            ? 'bg-blue-600 text-white'
                            : slot.available
                            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                            : 'bg-red-50 text-red-400 border border-red-200 cursor-not-allowed'
                        }`}
                      >
                        {slot.display}
                        {!slot.available && (
                          <div className="text-xs mt-1">Booked</div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Select turf and date to view available slots</p>
                  </div>
                )}
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment Details
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Advance Paid</label>
                    <input
                      type="number"
                      value={formData.advance_amount}
                      onChange={(e) => handleInputChange('advance_amount', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                {formData.amount && formData.advance_amount && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Remaining Amount: ₹{(parseFloat(formData.amount) - parseFloat(formData.advance_amount)).toFixed(2)}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special requirements or notes..."
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.turf_id || !formData.date || !formData.start_time || !formData.customer_name}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Create Booking
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OfflineBookingForm;