import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Plus, Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

const TurfOwnerDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'My Turfs', value: '3', icon: Building, color: 'bg-blue-500' },
    { title: 'Today Bookings', value: '12', icon: Calendar, color: 'bg-green-500' },
    { title: 'Monthly Revenue', value: '₹45,000', icon: DollarSign, color: 'bg-purple-500' },
    { title: 'Growth', value: '+15%', icon: TrendingUp, color: 'bg-orange-500' }
  ];

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your turfs and bookings</p>
          </div>
          <button
            onClick={() => navigate('/owner/turfs')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Building size={16} />
            <span>My Turfs</span>
          </button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/owner/turfs')}
              className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <Building className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="font-medium text-blue-600">My Turfs</p>
              <p className="text-sm text-gray-500">View and manage your turfs</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center">
              <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-green-600">View Bookings</p>
              <p className="text-sm text-gray-500">Manage your bookings</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="font-medium text-purple-600">Manage Staff</p>
              <p className="text-sm text-gray-500">Add or edit staff members</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TurfOwnerDashboard;