import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Building, Calendar, DollarSign, Users, Eye, ArrowUpRight, ArrowDownRight, Activity, Plus, Clock, CheckCircle, XCircle, Wifi, WifiOff, Crown, AlertTriangle, X } from 'lucide-react';
import CountUp from 'react-countup';
import Modal from 'react-modal';
import toast from 'react-hot-toast';

import { apiService } from '../services/api';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import { useNotifications } from '../hooks/useNotifications';


Modal.setAppElement('#root');

const TurfOwnerDashboard = () => {
  const [showOfflineBooking, setShowOfflineBooking] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const { notifications } = useNotifications(1); // Pass user ID
  const [offlineBookingData, setOfflineBookingData] = useState({
    turf_id: '',
    player_name: '',
    player_phone: '',
    date: '',
    time_slot: '',
    duration: '2',
    amount: ''
  });
  const [turfs, setTurfs] = useState([]);
  const [chartData, setChartData] = useState({
    revenue: [],
    bookings: [],
    performance: [],
    bookingStatus: [],
    onlineVsOffline: []
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [subscription, setSubscription] = useState({ revenue_model: { name: 'Free Plan' } });
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [loading, setLoading] = useState(true);
  
  const [creatingBooking, setCreatingBooking] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes, subscriptionRes, turfsRes, turfStatsRes] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getBookings({ per_page: 10, include: 'turf,player' }),
        apiService.getMySubscription().catch(() => ({ data: { subscription: { revenue_model: { name: 'Free Plan' } } } })),
        apiService.get('/turfs').catch(() => ({ data: { data: [] } })),
        apiService.get('/turf-stats').catch(() => ({ data: { total_turfs: 0, active_turfs: 0, inactive_turfs: 0 } }))
      ]);
      
      const dashboardStats = statsRes.data || {};
      const turfStats = turfStatsRes.data || {};
      
      setStats({
        ...dashboardStats,
        my_turfs: turfStats.total_turfs || 0,
        active_turfs: turfStats.active_turfs || 0,
        inactive_turfs: turfStats.inactive_turfs || 0
      });
      setRecentBookings(bookingsRes.data?.data || []);
      const subData = subscriptionRes.data?.subscription;
      setSubscription(subData || { revenue_model: { name: 'Free Plan' } });
      setTurfs(turfsRes.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats({
        my_turfs: 0,
        active_turfs: 0,
        inactive_turfs: 0,
        my_bookings: 0,
        monthly_earnings: 0,
        my_staff: 0,
        online_bookings: 0,
        offline_bookings: 0,
        pending_bookings: 0,
        confirmed_bookings: 0,
        cancelled_bookings: 0
      });
      setSubscription({ revenue_model: { name: 'Free Plan' } });
      setTurfs([]);
    }
  };

  useEffect(() => {
    
    setChartData({
      revenue: [
        { month: 'Jan', online: 15000, offline: 8000, total: 23000 },
        { month: 'Feb', online: 18000, offline: 12000, total: 30000 },
        { month: 'Mar', online: 22000, offline: 15000, total: 37000 },
        { month: 'Apr', online: 25000, offline: 18000, total: 43000 },
        { month: 'May', online: 28000, offline: 22000, total: 50000 },
        { month: 'Jun', online: 32000, offline: 25000, total: 57000 }
      ],
      bookings: [
        { name: 'Football', value: 60, color: '#3B82F6' },
        { name: 'Cricket', value: 25, color: '#10B981' },
        { name: 'Basketball', value: 15, color: '#F59E0B' }
      ],
      performance: [
        { day: 'Mon', online: 5, offline: 3, total: 8 },
        { day: 'Tue', online: 8, offline: 4, total: 12 },
        { day: 'Wed', online: 6, offline: 4, total: 10 },
        { day: 'Thu', online: 9, offline: 6, total: 15 },
        { day: 'Fri', online: 11, offline: 7, total: 18 },
        { day: 'Sat', online: 14, offline: 8, total: 22 },
        { day: 'Sun', online: 12, offline: 8, total: 20 }
      ],
      bookingStatus: [
        { name: 'Confirmed', value: 35, color: '#10B981' },
        { name: 'Pending', value: 5, color: '#F59E0B' },
        { name: 'Cancelled', value: 5, color: '#EF4444' }
      ],
      onlineVsOffline: [
        { name: 'Online', value: 28, color: '#3B82F6' },
        { name: 'Offline', value: 17, color: '#8B5CF6' }
      ]
    });
    
    // Chart data will be generated from real stats
    generateChartData();
  }, [stats]);

  const generateChartData = () => {
    setChartData({
      revenue: [
        { month: 'Jan', online: Math.floor((stats.monthly_earnings || 0) * 0.6), offline: Math.floor((stats.monthly_earnings || 0) * 0.4), total: stats.monthly_earnings || 0 },
        { month: 'Feb', online: Math.floor((stats.monthly_earnings || 0) * 0.65), offline: Math.floor((stats.monthly_earnings || 0) * 0.35), total: stats.monthly_earnings || 0 },
        { month: 'Mar', online: Math.floor((stats.monthly_earnings || 0) * 0.7), offline: Math.floor((stats.monthly_earnings || 0) * 0.3), total: stats.monthly_earnings || 0 },
        { month: 'Apr', online: Math.floor((stats.monthly_earnings || 0) * 0.68), offline: Math.floor((stats.monthly_earnings || 0) * 0.32), total: stats.monthly_earnings || 0 },
        { month: 'May', online: Math.floor((stats.monthly_earnings || 0) * 0.72), offline: Math.floor((stats.monthly_earnings || 0) * 0.28), total: stats.monthly_earnings || 0 },
        { month: 'Jun', online: Math.floor((stats.monthly_earnings || 0) * 0.75), offline: Math.floor((stats.monthly_earnings || 0) * 0.25), total: stats.monthly_earnings || 0 }
      ],
      bookings: [
        { name: 'Football', value: 60, color: '#3B82F6' },
        { name: 'Cricket', value: 25, color: '#10B981' },
        { name: 'Basketball', value: 15, color: '#F59E0B' }
      ],
      performance: [
        { day: 'Mon', online: Math.floor((stats.online_bookings || 0) / 7), offline: Math.floor((stats.offline_bookings || 0) / 7), total: Math.floor((stats.my_bookings || 0) / 7) },
        { day: 'Tue', online: Math.floor((stats.online_bookings || 0) / 7), offline: Math.floor((stats.offline_bookings || 0) / 7), total: Math.floor((stats.my_bookings || 0) / 7) },
        { day: 'Wed', online: Math.floor((stats.online_bookings || 0) / 7), offline: Math.floor((stats.offline_bookings || 0) / 7), total: Math.floor((stats.my_bookings || 0) / 7) },
        { day: 'Thu', online: Math.floor((stats.online_bookings || 0) / 7), offline: Math.floor((stats.offline_bookings || 0) / 7), total: Math.floor((stats.my_bookings || 0) / 7) },
        { day: 'Fri', online: Math.floor((stats.online_bookings || 0) / 7), offline: Math.floor((stats.offline_bookings || 0) / 7), total: Math.floor((stats.my_bookings || 0) / 7) },
        { day: 'Sat', online: Math.floor((stats.online_bookings || 0) / 7), offline: Math.floor((stats.offline_bookings || 0) / 7), total: Math.floor((stats.my_bookings || 0) / 7) },
        { day: 'Sun', online: Math.floor((stats.online_bookings || 0) / 7), offline: Math.floor((stats.offline_bookings || 0) / 7), total: Math.floor((stats.my_bookings || 0) / 7) }
      ],
      bookingStatus: [
        { name: 'Confirmed', value: stats.confirmed_bookings || 0, color: '#10B981' },
        { name: 'Pending', value: stats.pending_bookings || 0, color: '#F59E0B' },
        { name: 'Cancelled', value: stats.cancelled_bookings || 0, color: '#EF4444' }
      ],
      onlineVsOffline: [
        { name: 'Online', value: stats.online_bookings || 0, color: '#3B82F6' },
        { name: 'Offline', value: stats.offline_bookings || 0, color: '#8B5CF6' }
      ]
    });
  };

  const handleOfflineBooking = async (e) => {
    e.preventDefault();
    try {
      setCreatingBooking(true);
      await apiService.createBooking({ ...offlineBookingData, booking_type: 'offline' });
      toast.success('Offline booking created successfully!');
      setShowOfflineBooking(false);
      setOfflineBookingData({ turf_id: '', player_name: '', player_phone: '', date: '', time_slot: '', duration: '2', amount: '' });
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to create booking');
    } finally {
      setCreatingBooking(false);
    }
  };

  const calculateAmount = () => {
    const selectedTurf = turfs.find(t => t.id === parseInt(offlineBookingData.turf_id));
    if (selectedTurf && offlineBookingData.duration) {
      const amount = (selectedTurf.price_per_hour || 2000) * parseInt(offlineBookingData.duration);
      setOfflineBookingData(prev => ({ ...prev, amount: amount.toString() }));
    }
  };

  useEffect(() => {
    calculateAmount();
  }, [offlineBookingData.turf_id, offlineBookingData.duration]);

  const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
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
            <CountUp end={value} duration={2} />
          </p>
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ml-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full bg-gray-50/30 overflow-auto">
      <div className="p-6 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Overview</h1>
            <p className="text-gray-600 mt-1">Monitor your turf performance and growth</p>
          </div>
          <div className="flex items-center space-x-3">
            {(subscription?.revenue_model?.name === 'Free Plan' || !subscription) && (
              <div className="flex items-center space-x-2 bg-orange-50 text-orange-700 px-3 py-2 rounded-lg border border-orange-200">
                <AlertTriangle size={16} />
                <span className="text-sm font-medium">Free Plan - Limited Features</span>
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="ml-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                >
                  Upgrade
                </button>
              </div>
            )}
            <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Last 90 days</option>
            </select>
            <button 
              onClick={() => setShowAdvancedAnalytics(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <Eye size={16} />
              <span>Advanced Analytics</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <StatCard title="Total Turfs" value={stats.my_turfs || 0} change={5.2} icon={Building} color="bg-blue-500" trend="up" />
          <StatCard title="Active Turfs" value={stats.active_turfs || 0} change={3.1} icon={Building} color="bg-green-500" trend="up" />
          <StatCard title="Inactive Turfs" value={stats.inactive_turfs || 0} change={-1.2} icon={Building} color="bg-red-500" trend="down" />
          <StatCard title="Total Bookings" value={stats.my_bookings || 0} change={12.8} icon={Calendar} color="bg-purple-500" trend="up" />
          {subscription?.revenue_model?.name !== 'Free Plan' && subscription && (
            <>
              <StatCard title="Online Bookings" value={stats.online_bookings || 0} change={15.3} icon={Wifi} color="bg-indigo-500" trend="up" />
              <StatCard title="Offline Bookings" value={stats.offline_bookings || 0} change={8.7} icon={WifiOff} color="bg-orange-500" trend="up" />
            </>
          )}
          <StatCard title="Monthly Revenue" value={stats.monthly_earnings || 0} change={8.5} icon={DollarSign} color="bg-emerald-500" trend="up" />
          {subscription?.revenue_model?.name !== 'Free Plan' && subscription && (
            <StatCard title="Staff Members" value={stats.my_staff || 0} change={-2.1} icon={Users} color="bg-yellow-500" trend="down" />
          )}
        </div>



        {subscription?.revenue_model?.name !== 'Free Plan' && subscription && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h3>
                  <p className="text-sm text-gray-600">Online vs Offline revenue</p>
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.revenue}>
                  <defs>
                    <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOffline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Area type="monotone" dataKey="online" stackId="1" stroke="#3B82F6" fill="url(#colorOnline)" />
                  <Area type="monotone" dataKey="offline" stackId="1" stroke="#8B5CF6" fill="url(#colorOffline)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div><span className="text-sm text-gray-600">Online</span></div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2 bg-purple-500"></div><span className="text-sm text-gray-600">Offline</span></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Booking Status</h3>
                  <p className="text-sm text-gray-600">Current booking status</p>
                </div>
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData.bookingStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {chartData.bookingStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {chartData.bookingStatus.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-sm text-gray-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Daily Bookings</h3>
                <p className="text-sm text-gray-600">Online vs Offline bookings</p>
              </div>
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.performance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="online" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="offline" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div><span className="text-sm text-gray-600">Online</span></div>
              <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2 bg-purple-500"></div><span className="text-sm text-gray-600">Offline</span></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Booking Source</h3>
                <p className="text-sm text-gray-600">Online vs Offline distribution</p>
              </div>
              <Wifi className="w-5 h-5 text-indigo-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData.onlineVsOffline} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                  {chartData.onlineVsOffline.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {chartData.onlineVsOffline.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm text-gray-600">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {subscription?.revenue_model?.name !== 'Free Plan' && subscription && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <p className="text-sm text-gray-600">Latest booking activities with source tracking</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turf</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBookings.map((booking, index) => (
                    <motion.tr key={booking.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{booking.turf?.turf_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.player?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(booking.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{booking.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">₹{booking.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {booking.booking_type === 'online' ? (
                            <Wifi className="w-4 h-4 text-blue-500 mr-1" />
                          ) : (
                            <WifiOff className="w-4 h-4 text-purple-500 mr-1" />
                          )}
                          <span className={`text-xs font-medium ${
                            booking.booking_type === 'online' ? 'text-blue-600' : 'text-purple-600'
                          }`}>
                            {booking.booking_type}
                          </span>
                        </div>
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
        )}

        {subscription?.revenue_model?.name && !subscription.revenue_model.name.includes('Free') && (
          <Modal
            isOpen={showOfflineBooking}
            onRequestClose={() => setShowOfflineBooking(false)}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden outline-none"
            overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Offline Booking</h2>
              <p className="text-gray-600 mt-1">Create a walk-in booking</p>
            </div>
            
            <form onSubmit={handleOfflineBooking} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Turf</label>
                  <select
                    value={offlineBookingData.turf_id}
                    onChange={(e) => setOfflineBookingData({...offlineBookingData, turf_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose Turf</option>
                    {turfs.map(turf => (
                      <option key={turf.id} value={turf.id}>{turf.turf_name} - ₹{turf.price_per_hour || 2000}/hr</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Player Name</label>
                  <input
                    type="text"
                    value={offlineBookingData.player_name}
                    onChange={(e) => setOfflineBookingData({...offlineBookingData, player_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter player name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={offlineBookingData.player_phone}
                    onChange={(e) => setOfflineBookingData({...offlineBookingData, player_phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={offlineBookingData.date}
                    onChange={(e) => setOfflineBookingData({...offlineBookingData, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
                  <select
                    value={offlineBookingData.time_slot}
                    onChange={(e) => setOfflineBookingData({...offlineBookingData, time_slot: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Time</option>
                    <option value="06:00-08:00">6:00 AM - 8:00 AM</option>
                    <option value="08:00-10:00">8:00 AM - 10:00 AM</option>
                    <option value="10:00-12:00">10:00 AM - 12:00 PM</option>
                    <option value="14:00-16:00">2:00 PM - 4:00 PM</option>
                    <option value="16:00-18:00">4:00 PM - 6:00 PM</option>
                    <option value="18:00-20:00">6:00 PM - 8:00 PM</option>
                    <option value="20:00-22:00">8:00 PM - 10:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Hours)</label>
                  <select
                    value={offlineBookingData.duration}
                    onChange={(e) => setOfflineBookingData({...offlineBookingData, duration: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="1">1 Hour</option>
                    <option value="2">2 Hours</option>
                    <option value="3">3 Hours</option>
                    <option value="4">4 Hours</option>
                  </select>
                </div>
              </div>
              
              {offlineBookingData.amount && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                    <span className="text-lg font-bold text-blue-600">₹{offlineBookingData.amount}</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowOfflineBooking(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >Cancel</button>
                <button
                  type="submit"
                  disabled={creatingBooking}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {creatingBooking ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {showUpgrade && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Upgrade Your Plan</h3>
              <p className="text-gray-600 mb-4">Unlock premium features with a paid subscription.</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => window.location.href = '/owner/subscription'}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                >
                  View Plans
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Analytics Modal */}
        <Modal
          isOpen={showAdvancedAnalytics}
          onRequestClose={() => setShowAdvancedAnalytics(false)}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden outline-none"
          overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
            <button
              onClick={() => setShowAdvancedAnalytics(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[80vh]">
            <AdvancedAnalytics />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default TurfOwnerDashboard;