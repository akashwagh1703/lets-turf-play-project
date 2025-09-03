import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Building, Search, Filter, Eye, Edit, CheckCircle, XCircle, Plus } from 'lucide-react';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import CountUp from 'react-countup';
import { apiService } from '../services/api';
import OfflineBookingForm from './OfflineBookingForm';

Modal.setAppElement('#root');

const BookingManagement = () => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showOfflineBookingForm, setShowOfflineBookingForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, turfsRes] = await Promise.all([
        apiService.get('/bookings?include=turf,player').catch(() => ({ data: { data: [] } })),
        apiService.get('/turfs').catch(() => ({ data: { data: [] } }))
      ]);
      
      setBookings(bookingsRes.data?.data || []);
      setTurfs(turfsRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  const stats = useMemo(() => ({
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    revenue: bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.amount, 0)
  }), [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const playerName = booking.player?.name || booking.customer_name || '';
      const turfName = booking.turf?.turf_name || '';
      const matchesSearch = playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           turfName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      const matchesDate = dateFilter === 'all' || 
                         (dateFilter === 'today' && new Date(booking.date).toDateString() === new Date().toDateString()) ||
                         (dateFilter === 'week' && new Date(booking.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await apiService.put(`/bookings/${bookingId}`, { status: newStatus });
      toast.success(`Booking ${newStatus} successfully!`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  const handleOfflineBookingSuccess = () => {
    setShowOfflineBookingForm(false);
    fetchData();
  };

  const handleOfflineBookingClose = () => {
    setShowOfflineBookingForm(false);
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const StatCard = ({ title, value, icon: Icon, color, prefix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {prefix}<CountUp end={value} duration={1} />
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full bg-gray-50/30 overflow-auto">
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600 mt-1">Manage all turf bookings and reservations</p>
          </div>
          <button
            onClick={() => setShowOfflineBookingForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Offline Booking</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard title="Total Bookings" value={stats.total} icon={Calendar} color="bg-blue-500" />
          <StatCard title="Confirmed" value={stats.confirmed} icon={CheckCircle} color="bg-green-500" />
          <StatCard title="Pending" value={stats.pending} icon={Clock} color="bg-yellow-500" />
          <StatCard title="Cancelled" value={stats.cancelled} icon={XCircle} color="bg-red-500" />
          <StatCard title="Revenue" value={stats.revenue} icon={Building} color="bg-purple-500" prefix="₹" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Booking Details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading bookings...</p>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : filteredBookings.map((booking, index) => (
                  <motion.tr key={booking.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          booking.booking_type === 'offline' ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          <Building className={`w-5 h-5 ${
                            booking.booking_type === 'offline' ? 'text-purple-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{booking.turf?.turf_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">
                            #{booking.id} • {booking.booking_plan || 'single'} • {booking.booking_type || 'online'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.player?.name || booking.customer_name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.player?.phone || booking.customer_phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {booking.start_time && booking.end_time ? `${booking.start_time}-${booking.end_time}` : booking.time || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{booking.amount || 0}</div>
                      <div className="text-sm text-gray-500">
                        {booking.advance_amount > 0 ? `Advance: ₹${booking.advance_amount}` : 'Full Payment'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleView(booking)} className="text-blue-600 hover:text-blue-900 p-1 rounded">
                          <Eye size={16} />
                        </button>
                        {booking.status === 'pending' && (
                          <>
                            <button onClick={() => handleStatusUpdate(booking.id, 'confirmed')} className="text-green-600 hover:text-green-900 p-1 rounded">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => handleStatusUpdate(booking.id, 'cancelled')} className="text-red-600 hover:text-red-900 p-1 rounded">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* View Modal */}
        <Modal
          isOpen={showViewModal}
          onRequestClose={() => setShowViewModal(false)}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden outline-none"
          overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          {selectedBooking && (
            <>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                <p className="text-gray-600">#{selectedBooking.id}</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Turf</label>
                    <p className="text-gray-900 font-medium">{selectedBooking.turf?.turf_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer</label>
                    <p className="text-gray-900 font-medium">
                      {selectedBooking.player?.name || selectedBooking.customer_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-gray-900">{new Date(selectedBooking.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Time</label>
                    <p className="text-gray-900">
                      {selectedBooking.start_time && selectedBooking.end_time 
                        ? `${selectedBooking.start_time} - ${selectedBooking.end_time}` 
                        : selectedBooking.time || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Booking Plan</label>
                    <p className="text-gray-900 capitalize">{selectedBooking.booking_plan || 'single'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-gray-900 capitalize">{selectedBooking.booking_type || 'online'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Amount</label>
                    <p className="text-gray-900 font-medium">₹{selectedBooking.amount || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  {selectedBooking.advance_amount > 0 && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Advance Paid</label>
                        <p className="text-gray-900">₹{selectedBooking.advance_amount}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Remaining</label>
                        <p className="text-gray-900">₹{selectedBooking.remaining_amount || 0}</p>
                      </div>
                    </>
                  )}
                  {selectedBooking.notes && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">Notes</label>
                      <p className="text-gray-900">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </Modal>

        {/* Offline Booking Form */}
        <OfflineBookingForm
          isOpen={showOfflineBookingForm}
          onClose={handleOfflineBookingClose}
          turfs={turfs}
        />
      </div>
    </div>
  );
};

export default BookingManagement;