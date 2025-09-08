import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { X, Check } from 'lucide-react';
import { apiService } from '../services/api';

const OfflineBookingForm = ({ isOpen, onClose, turfs = [], planInfo = null }) => {
  const [formData, setFormData] = useState({
    turf_id: '',
    date: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    booking_plan: 'single',
    plan_duration: 1,
    slot_price: 500
  });
  
  const [selectedSlots, setSelectedSlots] = useState([]);
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);



  useEffect(() => {
    if (formData.turf_id && formData.date) {
      fetchAvailableSlots();
      setSelectedSlots([]); // Clear selected slots when turf/date changes
    }
  }, [formData.turf_id, formData.date]);

  const fetchAvailableSlots = async () => {
    if (!formData.turf_id || !formData.date) {
      setAvailableSlots([]);
      return;
    }
    
    try {
      setSlotsLoading(true);
      const response = await apiService.getAvailableSlots(formData.turf_id, formData.date);
      
      if (response.data && Array.isArray(response.data.slots)) {
        setAvailableSlots(response.data.slots);
      } else {
        console.warn('Invalid slots data received:', response.data);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch available slots';
      toast.error(errorMessage);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSlotToggle = (slot) => {
    if (!slot.available) {
      toast.error('This time slot is not available');
      return;
    }
    
    setSelectedSlots(prev => {
      const isSelected = prev.some(s => s.start_time === slot.start_time);
      if (isSelected) {
        return prev.filter(s => s.start_time !== slot.start_time);
      } else {
        // Validate slot data
        if (!slot.start_time || !slot.end_time) {
          toast.error('Invalid slot data');
          return prev;
        }
        
        return [...prev, {
          start_time: slot.start_time,
          end_time: slot.end_time
        }];
      }
    });
  };

  const calculateTotalAmount = () => {
    const baseAmount = selectedSlots.length * formData.slot_price;
    const duration = formData.plan_duration;
    
    switch (formData.booking_plan) {
      case 'daily': return baseAmount * duration;
      case 'weekly': return baseAmount * duration * 7;
      case 'monthly': return baseAmount * duration * 30;
      case 'yearly': return baseAmount * duration * 365;
      default: return baseAmount;
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.turf_id || !formData.date || selectedSlots.length === 0) {
      toast.error('Please fill all required fields and select at least one time slot');
      return;
    }
    
    if (!formData.customer_name.trim() || !formData.customer_phone.trim()) {
      toast.error('Customer name and phone are required');
      return;
    }
    
    if (formData.slot_price <= 0) {
      toast.error('Slot price must be greater than 0');
      return;
    }
    
    setLoading(true);

    try {
      // Prepare booking data
      const bookingData = {
        turf_id: parseInt(formData.turf_id),
        date: formData.date,
        selected_slots: selectedSlots,
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_email: formData.customer_email.trim() || null,
        booking_type: 'offline',
        booking_plan: formData.booking_plan,
        plan_duration: formData.plan_duration,
        amount: calculateTotalAmount(),
        advance_amount: 0,
        notes: null
      };
      
      console.log('Sending booking data:', bookingData);
      const response = await apiService.createBooking(bookingData);
      console.log('Booking response:', response);
      
      if (response.data?.success) {
        toast.success(response.data.message || 'Booking created successfully!');
        onClose();
        // Reset form
        setFormData({
          turf_id: '',
          date: '',
          customer_name: '',
          customer_phone: '',
          customer_email: '',
          booking_plan: 'single',
          plan_duration: 1,
          slot_price: 500
        });
        setSelectedSlots([]);
        setAvailableSlots([]);
        
        // Refresh parent component data
        if (window.location.pathname.includes('bookings')) {
          window.location.reload();
        }
      } else {
        throw new Error(response.data?.message || 'Booking creation failed');
      }
    } catch (error) {
      console.error('Booking creation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create booking';
      toast.error(errorMessage);
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
        className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
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
          <div className="space-y-6">
            {/* Turf & Date Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Turf</label>
                <select
                  value={formData.turf_id}
                  onChange={(e) => handleInputChange('turf_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a turf</option>
                  {turfs.map(turf => (
                    <option key={turf.id} value={turf.id}>
                      {turf.turf_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Booking Plan */}
            <div className="grid grid-cols-5 gap-2">
              {['single', 'daily', 'weekly', 'monthly', 'yearly'].map(plan => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => {
                    handleInputChange('booking_plan', plan);
                    if (plan === 'single') {
                      handleInputChange('plan_duration', 1);
                    }
                  }}
                  className={`p-2 rounded text-sm font-medium capitalize ${
                    formData.booking_plan === plan
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {plan}
                </button>
              ))}
            </div>

            {/* Duration & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.booking_plan === 'single' ? 'Duration (Fixed)' : 'Duration'}
                </label>
                <input
                  type="number"
                  value={formData.plan_duration}
                  onChange={(e) => handleInputChange('plan_duration', parseInt(e.target.value) || 1)}
                  min="1"
                  max="12"
                  disabled={formData.booking_plan === 'single'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Slot (₹)</label>
                <input
                  type="number"
                  value={formData.slot_price}
                  onChange={(e) => handleInputChange('slot_price', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Time Slots */}
            {formData.turf_id && formData.date && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time Slots ({selectedSlots.length} selected)
                </label>
                {slotsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                    {availableSlots.map((slot, index) => {
                      const isSelected = selectedSlots.some(s => s.start_time === slot.start_time);
                      return (
                        <button
                          key={index}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => handleSlotToggle(slot)}
                          className={`p-2 rounded text-xs font-medium ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : slot.available
                              ? 'bg-green-50 text-green-700 border hover:bg-green-100'
                              : 'bg-red-50 text-red-400 cursor-not-allowed'
                          }`}
                        >
                          {slot.display}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Customer Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleInputChange('customer_email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Payment Summary */}
            {selectedSlots.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Payment Summary</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>Slots: {selectedSlots.length} × ₹{formData.slot_price} = ₹{selectedSlots.length * formData.slot_price}</div>
                  {formData.booking_plan !== 'single' && (
                    <div>Plan: {formData.booking_plan} × {formData.plan_duration}</div>
                  )}
                  <div className="font-bold text-lg border-t pt-2">
                    Total Amount: ₹{calculateTotalAmount()}
                  </div>
                </div>
              </div>
            )}
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
              disabled={loading || !formData.turf_id || !formData.date || selectedSlots.length === 0 || !formData.customer_name || !formData.customer_phone || !formData.slot_price || formData.slot_price <= 0}
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