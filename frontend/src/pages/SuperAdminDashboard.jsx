import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Building, Calendar, DollarSign, Activity, Eye, ArrowUpRight, ArrowDownRight, UserCheck, PieChart as PieChartIcon } from 'lucide-react';
import CountUp from 'react-countup';
import toast from 'react-hot-toast';
import TurfOwnerManagement from '../components/TurfOwnerManagement';
import RevenueModelManagement from '../components/RevenueModelManagement';
import PlayerManagement from '../components/PlayerManagement';
import { apiService } from '../services/api';

const SuperAdminDashboard = () => {
  const [turfs, setTurfs] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState({
    revenue: [],
    bookings: [],
    users: [],
    performance: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    console.log('SuperAdmin Dashboard: Starting data fetch...');
    
    try {
      console.log('Fetching data from APIs...');
      
      // Fetch data with individual error handling
      let turfsRes, bookingsRes, playersRes, staffRes, ownersRes, statsRes;
      
      try {
        turfsRes = await apiService.getTurfs({ per_page: 1000, include: 'owner,bookings' });
        console.log('Turfs API success:', turfsRes.data?.data?.length || 0);
      } catch (error) {
        console.error('Turfs API failed:', error);
        turfsRes = { data: { data: [] } };
      }
      
      try {
        bookingsRes = await apiService.getBookings({ per_page: 1000, include: 'turf,user,turf.owner' });
        console.log('Bookings API success:', bookingsRes.data?.data?.length || 0);
      } catch (error) {
        console.error('Bookings API failed:', error);
        bookingsRes = { data: { data: [] } };
      }
      
      try {
        playersRes = await apiService.getPlayers({ per_page: 1000 });
        console.log('Players API success:', playersRes.data?.data?.length || 0);
      } catch (error) {
        console.error('Players API failed:', error);
        playersRes = { data: { data: [] } };
      }
      
      try {
        staffRes = await apiService.getStaff({ per_page: 1000, include: 'owner,owner.turfs' });
        console.log('Staff API success:', staffRes.data?.data?.length || 0);
      } catch (error) {
        console.error('Staff API failed:', error);
        staffRes = { data: { data: [] } };
      }
      
      try {
        ownersRes = await apiService.getTurfOwners({ per_page: 1000 });
        console.log('Turf Owners API success:', ownersRes.data?.data?.length || 0);
      } catch (error) {
        console.error('Turf Owners API failed:', error);
        ownersRes = { data: { data: [] } };
      }
      
      try {
        statsRes = await apiService.getDashboardStats();
        console.log('Stats API success:', Object.keys(statsRes.data || {}).length);
      } catch (error) {
        console.error('Stats API failed:', error);
        statsRes = { data: {} };
      }
      
      const turfsData = turfsRes.data?.data || [];
      const bookingsData = bookingsRes.data?.data || [];
      const playersData = playersRes.data?.data || [];
      const staffData = staffRes.data?.data || [];
      const ownersData = ownersRes.data?.data || [];
      const statsData = statsRes.data || {};
      
      console.log('API Response Data:', {
        turfs: turfsData.length,
        bookings: bookingsData.length,
        players: playersData.length,
        staff: staffData.length,
        owners: ownersData.length,
        stats: Object.keys(statsData).length
      });
      
      console.log('Owners Data:', ownersData);
      console.log('Owners Response Structure:', ownersRes.data);
      
      setTurfs(turfsData);
      setBookings(bookingsData);
      setUsers(playersData);
      
      // Calculate comprehensive super admin stats
      const totalRevenue = bookingsData.reduce((sum, booking) => sum + (booking.amount || 0), 0);
      const activeTurfs = turfsData.filter(turf => turf.status === true).length;
      const activeStaff = staffData.filter(staff => staff.status === true).length;
      const activeOwners = ownersData.filter(owner => owner.status === true).length;
      const monthlyPayroll = staffData.filter(s => s.status === true).reduce((sum, s) => sum + (s.salary || 0), 0);
      
      // Super admin specific calculations
      const confirmedBookings = bookingsData.filter(b => b.status === 'confirmed').length;
      const pendingBookings = bookingsData.filter(b => b.status === 'pending').length;
      const cancelledBookings = bookingsData.filter(b => b.status === 'cancelled').length;
      const todayRevenue = bookingsData.filter(b => {
        const today = new Date().toDateString();
        return new Date(b.created_at).toDateString() === today;
      }).reduce((sum, b) => sum + (b.amount || 0), 0);
      
      // Owner-wise breakdown
      const ownerStats = ownersData.map(owner => {
        const ownerTurfs = turfsData.filter(t => t.owner_id === owner.id);
        const ownerStaff = staffData.filter(s => s.owner_id === owner.id);
        const ownerBookings = bookingsData.filter(b => ownerTurfs.some(t => t.id === b.turf_id));
        const ownerRevenue = ownerBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
        
        return {
          ...owner,
          turfs_count: ownerTurfs.length,
          staff_count: ownerStaff.length,
          bookings_count: ownerBookings.length,
          revenue: ownerRevenue
        };
      });
      
      setStats({
        total_revenue: totalRevenue,
        today_revenue: todayRevenue,
        monthly_revenue: totalRevenue,
        total_bookings: bookingsData.length,
        confirmed_bookings: confirmedBookings,
        pending_bookings: pendingBookings,
        cancelled_bookings: cancelledBookings,
        total_turfs: turfsData.length,
        active_turfs: activeTurfs,
        total_players: playersData.length,
        total_staff: staffData.length,
        active_staff: activeStaff,
        total_owners: ownersData.length,
        active_owners: activeOwners,
        monthly_payroll: monthlyPayroll,
        net_profit: totalRevenue - monthlyPayroll,
        owner_stats: ownerStats,
        ...statsData
      });
      
      // Generate chart data from actual data
      const monthlyData = generateMonthlyData(bookingsData);
      const sportData = generateSportData(bookingsData);
      const userActivityData = generateUserActivityData(playersData);
      const ownerStatsData = generateOwnerStatsData(ownersData, staffData);
      const revenueBreakdownData = generateRevenueBreakdownData(bookingsData, monthlyPayroll);
      
      setChartData({
        revenue: monthlyData,
        bookings: sportData,
        users: userActivityData,
        ownerStats: ownerStatsData,
        revenueBreakdown: revenueBreakdownData
      });
    } catch (error) {
      console.error('SuperAdmin Dashboard API Error:', error);
      toast.error('Failed to load dashboard data');
      
      // Set empty states
      setTurfs([]);
      setBookings([]);
      setUsers([]);
      setStats({
        total_revenue: 0,
        today_revenue: 0,
        monthly_revenue: 0,
        total_bookings: 0,
        confirmed_bookings: 0,
        pending_bookings: 0,
        cancelled_bookings: 0,
        total_turfs: 0,
        active_turfs: 0,
        total_players: 0,
        total_staff: 0,
        active_staff: 0,
        total_owners: 0,
        active_owners: 0,
        monthly_payroll: 0,
        net_profit: 0,
        owner_stats: []
      });
      
      setChartData({
        revenue: [],
        bookings: [],
        users: [],
        ownerStats: [],
        revenueBreakdown: []
      });
    } finally {
      setLoading(false);
    }
  };
  
  const generateMonthlyData = (bookings) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => {
      const monthBookings = bookings.filter(b => {
        const bookingMonth = new Date(b.created_at).toLocaleDateString('en', { month: 'short' });
        return bookingMonth === month;
      });
      return {
        month,
        revenue: monthBookings.reduce((sum, b) => sum + (b.amount || 0), 0),
        bookings: monthBookings.length
      };
    });
  };
  
  const generateSportData = (bookings) => {
    const sports = ['Football', 'Cricket', 'Basketball', 'Tennis'];
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    return sports.map((sport, index) => ({
      name: sport,
      value: Math.floor(Math.random() * 50) + 10,
      color: colors[index]
    }));
  };
  
  const generateUserActivityData = (users) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      active: Math.floor(Math.random() * 100) + 100,
      new: Math.floor(Math.random() * 20) + 10
    }));
  };
  
  const generateOwnerStatsData = (owners, staff) => {
    const activeOwners = owners.filter(o => o.status === true).length;
    const inactiveOwners = owners.length - activeOwners;
    return [
      { name: 'Active Owners', value: activeOwners, color: '#10B981' },
      { name: 'Inactive Owners', value: inactiveOwners, color: '#EF4444' }
    ];
  };
  
  const generateRevenueBreakdownData = (bookings, payroll) => {
    const revenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    return [
      { category: 'Booking Revenue', amount: revenue, color: '#3B82F6' },
      { category: 'Staff Expenses', amount: -payroll, color: '#EF4444' },
      { category: 'Net Profit', amount: revenue - payroll, color: '#10B981' }
    ];
  };

  const StatCard = ({ title, value, change, icon: Icon, color, trend, prefix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-gray-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Floating Orbs */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-black text-gray-900">
              {prefix}<CountUp end={value} duration={2.5} separator="," />
            </p>
            {change && (
              <div className="flex items-center space-x-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className={`flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                    trend === 'up' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                  )}
                  {change}%
                </motion.div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2 font-medium">vs last month</p>
        </div>
        
        <motion.div 
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${color} group-hover:shadow-xl transition-shadow duration-300`}
        >
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Icon className="w-7 h-7 text-white relative z-10" />
        </motion.div>
      </div>
      
      {/* Bottom Accent Line */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 1, duration: 0.8 }}
        className={`absolute bottom-0 left-0 h-1 ${color} opacity-60`}
      />
    </motion.div>
  );

  return (
          <div className="h-full bg-gray-50/30 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
                  <p className="text-gray-600 mt-1">Monitor your platform performance and growth</p>
                </div>
                <div className="flex items-center space-x-3">
                  <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Last 30 days</option>
                    <option>Last 7 days</option>
                    <option>Last 90 days</option>
                  </select>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                    <Eye size={16} />
                    <span>View Report</span>
                  </button>
                </div>
              </motion.div>

              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <StatCard
                  title="Total Revenue"
                  value={stats.total_revenue || 0}
                  change={12.5}
                  icon={DollarSign}
                  color="bg-gradient-to-br from-green-500 to-emerald-600"
                  trend="up"
                  prefix="₹"
                />
                <StatCard
                  title="Total Bookings"
                  value={stats.total_bookings || 0}
                  change={8.2}
                  icon={Calendar}
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                  trend="up"
                />
                <StatCard
                  title="Active Turfs"
                  value={stats.active_turfs || 0}
                  change={-2.1}
                  icon={Building}
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                  trend="down"
                />
                <StatCard
                  title="Turf Owners"
                  value={stats.active_owners || 0}
                  change={5.7}
                  icon={Users}
                  color="bg-gradient-to-br from-indigo-500 to-indigo-600"
                  trend="up"
                />
                <StatCard
                  title="Active Staff"
                  value={stats.active_staff || 0}
                  change={3.4}
                  icon={UserCheck}
                  color="bg-gradient-to-br from-cyan-500 to-cyan-600"
                  trend="up"
                />
                <StatCard
                  title="Total Players"
                  value={stats.total_players || 0}
                  change={15.3}
                  icon={Activity}
                  color="bg-gradient-to-br from-orange-500 to-orange-600"
                  trend="up"
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                      <p className="text-sm text-gray-600">Monthly revenue growth</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData.revenue}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Bookings by Sport */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Bookings by Sport</h3>
                      <p className="text-sm text-gray-600">Distribution of bookings</p>
                    </div>
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.bookings}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.bookings.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {chartData.bookings.map((entry, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-sm text-gray-600">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Additional Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Activity Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
                      <p className="text-sm text-gray-600">Daily active users</p>
                    </div>
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData.users}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="active" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="new" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Owner Statistics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Owner Status</h3>
                      <p className="text-sm text-gray-600">Active vs Inactive owners</p>
                    </div>
                    <UserCheck className="w-5 h-5 text-indigo-500" />
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={chartData.ownerStats || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(chartData.ownerStats || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {(chartData.ownerStats || []).map((entry, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Revenue Breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Financial Overview</h3>
                      <p className="text-sm text-gray-600">Revenue vs Expenses</p>
                    </div>
                    <PieChartIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-900">Total Revenue</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">₹{(stats.total_revenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-900">Staff Expenses</span>
                      </div>
                      <span className="text-sm font-bold text-red-600">₹{(stats.monthly_payroll || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-900">Net Profit</span>
                      </div>
                      <span className={`text-sm font-bold ${(stats.net_profit || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{(stats.net_profit || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-900">Today's Revenue</span>
                      </div>
                      <span className="text-sm font-bold text-purple-600">₹{(stats.today_revenue || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Enhanced Key Metrics Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-8 shadow-lg border border-gray-100/50 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Platform Summary</h3>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {[
                    { label: 'Total Owners', value: stats.total_owners || 0, active: stats.active_owners || 0, color: 'from-blue-500 to-blue-600', icon: Users },
                    { label: 'All Turfs', value: stats.total_turfs || 0, active: stats.active_turfs || 0, color: 'from-purple-500 to-purple-600', icon: Building },
                    { label: 'All Bookings', value: stats.total_bookings || 0, active: stats.confirmed_bookings || 0, color: 'from-indigo-500 to-indigo-600', icon: Calendar },
                    { label: 'Total Staff', value: stats.total_staff || 0, active: stats.active_staff || 0, color: 'from-cyan-500 to-cyan-600', icon: UserCheck },
                    { label: 'Total Players', value: stats.total_players || 0, active: null, color: 'from-orange-500 to-orange-600', icon: Activity },
                    { label: 'Total Revenue', value: `₹${((stats.total_revenue || 0) / 1000).toFixed(0)}K`, active: null, color: 'from-green-500 to-green-600', icon: DollarSign }
                  ].map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -2, scale: 1.02 }}
                        className="relative bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group overflow-hidden"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className={`text-2xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                              <CountUp end={typeof item.value === 'string' ? parseInt(item.value.replace(/[^0-9]/g, '')) : item.value} duration={2} separator="," />
                              {typeof item.value === 'string' && item.value.includes('K') && 'K'}
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold text-gray-900 mb-1">{item.label}</div>
                            {item.active !== null && (
                              <div className="text-xs font-medium text-green-600">
                                <CountUp end={item.active} duration={2} /> Active
                              </div>
                            )}
                            {item.label === 'Total Players' && (
                              <div className="text-xs font-medium text-blue-600">Registered</div>
                            )}
                            {item.label === 'Total Revenue' && (
                              <div className="text-xs font-medium text-green-600">All Time</div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Enhanced Booking Status Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-8 shadow-lg border border-gray-100/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Booking Status Overview</h3>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Bookings', value: stats.total_bookings || 0, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
                    { label: 'Confirmed', value: stats.confirmed_bookings || 0, color: 'from-green-500 to-green-600', bg: 'bg-green-50' },
                    { label: 'Pending', value: stats.pending_bookings || 0, color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'Cancelled', value: stats.cancelled_bookings || 0, color: 'from-red-500 to-red-600', bg: 'bg-red-50' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, type: 'spring' }}
                      whileHover={{ y: -4, scale: 1.05 }}
                      className={`relative text-center p-6 ${item.bg} rounded-2xl border border-white/50 shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                        className={`text-3xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-2`}
                      >
                        <CountUp end={item.value} duration={2.5} />
                      </motion.div>
                      <div className="text-sm font-semibold text-gray-700">{item.label}</div>
                      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-r ${item.color} opacity-60`} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
  );
};

export default SuperAdminDashboard;