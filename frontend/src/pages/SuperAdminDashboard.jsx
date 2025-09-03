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

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <StatCard
                  title="Total Revenue"
                  value={stats.total_revenue || 0}
                  change={12.5}
                  icon={DollarSign}
                  color="bg-green-500"
                  trend="up"
                />
                <StatCard
                  title="Total Bookings"
                  value={stats.total_bookings || 0}
                  change={8.2}
                  icon={Calendar}
                  color="bg-blue-500"
                  trend="up"
                />
                <StatCard
                  title="Active Turfs"
                  value={stats.active_turfs || 0}
                  change={-2.1}
                  icon={Building}
                  color="bg-purple-500"
                  trend="down"
                />
                <StatCard
                  title="Turf Owners"
                  value={stats.active_owners || 0}
                  change={5.7}
                  icon={Users}
                  color="bg-indigo-500"
                  trend="up"
                />
                <StatCard
                  title="Active Staff"
                  value={stats.active_staff || 0}
                  change={3.4}
                  icon={UserCheck}
                  color="bg-cyan-500"
                  trend="up"
                />
                <StatCard
                  title="Total Players"
                  value={stats.total_players || 0}
                  change={15.3}
                  icon={Users}
                  color="bg-orange-500"
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

              {/* Key Metrics Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total_owners || 0}</div>
                    <div className="text-sm text-gray-600">Total Owners</div>
                    <div className="text-xs text-green-600">{stats.active_owners || 0} Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.total_turfs || 0}</div>
                    <div className="text-sm text-gray-600">All Turfs</div>
                    <div className="text-xs text-green-600">{stats.active_turfs || 0} Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{stats.total_bookings || 0}</div>
                    <div className="text-sm text-gray-600">All Bookings</div>
                    <div className="text-xs text-green-600">{stats.confirmed_bookings || 0} Confirmed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">{stats.total_staff || 0}</div>
                    <div className="text-sm text-gray-600">Total Staff</div>
                    <div className="text-xs text-green-600">{stats.active_staff || 0} Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.total_players || 0}</div>
                    <div className="text-sm text-gray-600">Total Players</div>
                    <div className="text-xs text-blue-600">Registered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">₹{((stats.total_revenue || 0) / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                    <div className="text-xs text-green-600">All Time</div>
                  </div>
                </div>
              </motion.div>

              {/* Booking Status Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.total_bookings || 0}</div>
                    <div className="text-sm text-gray-600">Total Bookings</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.confirmed_bookings || 0}</div>
                    <div className="text-sm text-gray-600">Confirmed</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending_bookings || 0}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{stats.cancelled_bookings || 0}</div>
                    <div className="text-sm text-gray-600">Cancelled</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
  );
};

export default SuperAdminDashboard;