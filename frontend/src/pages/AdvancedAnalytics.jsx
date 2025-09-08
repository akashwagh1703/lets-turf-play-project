import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, DollarSign, Users, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { apiService } from '../services/api';

const AdvancedAnalytics = () => {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [planInfo, setPlanInfo] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (hasAccess) {
      fetchAnalytics();
    }
  }, [timeRange, hasAccess]);

  const checkAccess = async () => {
    try {
      const response = await apiService.getMyPlan();
      const plan = response.data?.plan;
      setPlanInfo(plan);
      
      const hasAnalyticsFeature = plan?.features?.some(f => f.name === 'Advanced Analytics');
      setHasAccess(hasAnalyticsFeature);
      
      if (!hasAnalyticsFeature) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to check plan access:', error);
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdvancedAnalytics({ days: timeRange });
      setAnalytics(response.data || {});
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp size={16} className="mr-1" />
            {change >= 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="h-full bg-gray-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="h-full bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h2>
          <p className="text-gray-600 mb-4">This feature is not available in your current plan.</p>
          <p className="text-sm text-gray-500 mb-6">Upgrade to Premium or Enterprise plan to access detailed analytics.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50/30 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-600 mt-1">Detailed insights for your turf business</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={`₹${analytics.total_revenue || 0}`}
            change={analytics.revenue_change}
            icon={DollarSign}
            color="bg-green-500"
          />
          <MetricCard
            title="Total Bookings"
            value={analytics.total_bookings || 0}
            change={analytics.bookings_change}
            icon={Calendar}
            color="bg-blue-500"
          />
          <MetricCard
            title="Active Turfs"
            value={analytics.active_turfs || 0}
            change={analytics.turfs_change}
            icon={MapPin}
            color="bg-purple-500"
          />
          <MetricCard
            title="Avg. Daily Revenue"
            value={`₹${analytics.avg_daily_revenue || 0}`}
            change={analytics.daily_revenue_change}
            icon={TrendingUp}
            color="bg-orange-500"
          />
        </div>

        {/* Revenue Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-6 shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Revenue Trend</h3>
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={analytics.revenue_trend || []}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Revenue']} 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="url(#revenueGradient)" 
                    fill="url(#revenueGradient)" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-2xl p-6 shadow-xl border border-green-100 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Revenue Breakdown</h3>
                <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <defs>
                    <linearGradient id="onlineGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                    <linearGradient id="offlineGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="peakGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={[
                      { name: 'Online', value: analytics.online_revenue || 0, color: 'url(#onlineGradient)' },
                      { name: 'Offline', value: analytics.offline_revenue || 0, color: 'url(#offlineGradient)' },
                      { name: 'Peak Hours', value: analytics.peak_hour_revenue || 0, color: 'url(#peakGradient)' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    <Cell fill="url(#onlineGradient)" />
                    <Cell fill="url(#offlineGradient)" />
                    <Cell fill="url(#peakGradient)" />
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Booking Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50"></div>
            <div className="relative z-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Confirmed</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(analytics.confirmed_bookings / analytics.total_bookings * 100) || 0}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold">{analytics.confirmed_bookings || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(analytics.pending_bookings / analytics.total_bookings * 100) || 0}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold">{analytics.pending_bookings || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cancelled</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(analytics.cancelled_bookings / analytics.total_bookings * 100) || 0}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold">{analytics.cancelled_bookings || 0}</span>
                </div>
              </div>
            </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-yellow-50/50"></div>
            <div className="relative z-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Turfs</h3>
            <div className="space-y-3">
              {(analytics.top_turfs || []).map((turf, index) => (
                <div key={turf.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{turf.turf_name}</div>
                      <div className="text-sm text-gray-500">{turf.bookings_count} bookings</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">₹{turf.revenue}</div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </motion.div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-orange-50 via-white to-red-50 rounded-2xl p-6 shadow-xl border border-orange-100 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Peak Hours Analysis</h3>
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analytics.peak_hours || []}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#EA580C" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="hour" 
                    formatter={(value) => `${value}:00`} 
                    stroke="#6B7280" 
                    fontSize={12}
                  />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => [value, name === 'bookings' ? 'Bookings' : 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                  <Bar 
                    dataKey="bookings" 
                    fill="url(#barGradient)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-2xl p-6 shadow-xl border border-indigo-100 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Monthly Trends</h3>
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full animate-pulse"></div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={analytics.monthly_bookings || []}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={4}
                    dot={{ fill: '#6366F1', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#6366F1', strokeWidth: 2, fill: '#FFFFFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;