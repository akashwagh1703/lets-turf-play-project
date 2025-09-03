import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Users, DollarSign, Download } from 'lucide-react';
import api from '../services/api';

const AdvancedAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    revenue: [],
    bookings: [],
    userGrowth: [],
    turfUtilization: []
  });
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.getAdvancedAnalytics({ days: dateRange });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({
        revenue: [],
        bookings: [],
        userGrowth: [],
        turfUtilization: []
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <div className="flex gap-4">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button 
            onClick={exportData}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="text-green-600" size={20} />
          Revenue Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.revenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Booking Patterns */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="text-blue-600" size={20} />
          Booking Patterns
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.bookings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="text-purple-600" size={20} />
            User Growth
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Turf Utilization */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-orange-600" size={20} />
            Turf Utilization
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.turfUtilization}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.turfUtilization.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;