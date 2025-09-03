import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, DollarSign, TrendingUp } from 'lucide-react';
import CountUp from 'react-countup';
import { apiService } from '../services/api';

const StaffDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getBookings({ per_page: 5, include: 'turf' })
      ]);
      
      setStats(statsRes.data || {});
      setRecentBookings(bookingsRes.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats({
        total_bookings: 0,
        today_bookings: 0,
        pending_bookings: 0,
        confirmed_bookings: 0,
        cancelled_bookings: 0,
        revenue_today: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color, trend, prefix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {prefix}<CountUp end={value} duration={2} />
          </p>
          {change && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`w-4 h-4 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm font-medium ml-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs yesterday</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="h-full bg-gray-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50/30 overflow-auto">
      <div className="p-6 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage daily operations and bookings</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Total Bookings" 
            value={stats.total_bookings || 0} 
            change={8.2} 
            icon={Calendar} 
            color="bg-blue-500" 
            trend="up" 
          />
          <StatCard 
            title="Today's Bookings" 
            value={stats.today_bookings || 0} 
            change={12.5} 
            icon={Clock} 
            color="bg-purple-500" 
            trend="up" 
          />
          <StatCard 
            title="Confirmed" 
            value={stats.confirmed_bookings || 0} 
            change={5.8} 
            icon={CheckCircle} 
            color="bg-green-500" 
            trend="up" 
          />
          <StatCard 
            title="Pending" 
            value={stats.pending_bookings || 0} 
            change={-2.1} 
            icon={Clock} 
            color="bg-yellow-500" 
            trend="down" 
          />
          <StatCard 
            title="Cancelled" 
            value={stats.cancelled_bookings || 0} 
            change={-15.3} 
            icon={XCircle} 
            color="bg-red-500" 
            trend="down" 
          />
          <StatCard 
            title="Today's Revenue" 
            value={stats.revenue_today || 0} 
            change={18.7} 
            icon={DollarSign} 
            color="bg-emerald-500" 
            trend="up" 
            prefix="₹" 
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <p className="text-sm text-gray-600">Latest booking activities</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turf</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No recent bookings found
                    </td>
                  </tr>
                ) : recentBookings.map((booking, index) => (
                  <motion.tr 
                    key={booking.id} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: index * 0.1 }} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.turf?.turf_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.customer_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{booking.customer_phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(booking.date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">
                        {booking.start_time && booking.end_time ? `${booking.start_time}-${booking.end_time}` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ₹{booking.amount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StaffDashboard;