import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import api from '../services/api';

const AdvancedAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [revenue, customer, performance] = await Promise.all([
        api.get(`/analytics/revenue?days=${timeRange}`),
        api.get('/analytics/customers'),
        api.get('/analytics/performance')
      ]);

      setAnalytics({
        revenue: revenue.data,
        customer: customer.data,
        performance: performance.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading analytics...</div>;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Advanced Analytics</h1>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">₹{analytics?.revenue?.total_revenue?.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold">{analytics?.customer?.total_customers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupancy Rate</p>
              <p className="text-2xl font-bold">{analytics?.performance?.occupancy_rate}%</p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Retention Rate</p>
              <p className="text-2xl font-bold">{analytics?.customer?.customer_retention}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Daily Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.revenue?.daily_revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Turf */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue by Turf</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.revenue?.revenue_by_turf}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turf.turf_name" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Peak Hours Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.revenue?.peak_hours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Customers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
          <div className="space-y-3">
            {analytics?.customer?.top_customers?.slice(0, 5).map((customer, index) => (
              <div key={customer.user_id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{customer.user?.name}</p>
                  <p className="text-sm text-gray-600">{customer.bookings} bookings</p>
                </div>
                <p className="font-semibold">₹{customer.total_spent}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{analytics?.performance?.avg_booking_value?.toFixed(0)}</p>
            <p className="text-sm text-gray-600">Avg Booking Value</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{analytics?.performance?.cancellation_rate}%</p>
            <p className="text-sm text-gray-600">Cancellation Rate</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{analytics?.performance?.conversion_rate}%</p>
            <p className="text-sm text-gray-600">Conversion Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;