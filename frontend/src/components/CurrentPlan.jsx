import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Calendar, Users, Building, BookOpen, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const CurrentPlan = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const response = await apiService.getMyPlan();
      setPlan(response.data?.plan);
    } catch (error) {
      console.error('Failed to fetch current plan:', error);
      toast.error('Failed to load plan information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleAutoAssignFreePlan = async () => {
    try {
      setLoading(true);
      const response = await apiService.post('/auto-assign-free-plan');
      if (response.data.success) {
        toast.success('Free plan assigned successfully!');
        fetchCurrentPlan();
      } else {
        toast.error(response.data.message || 'Failed to assign free plan');
      }
    } catch (error) {
      console.error('Failed to assign free plan:', error);
      toast.error('Failed to assign free plan');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Plan Found</h3>
          <p className="text-gray-600 mb-4">You don't have an active plan assigned to your account.</p>
          <button
            onClick={handleAutoAssignFreePlan}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Assigning...' : 'Get Free Plan'}
          </button>
          <p className="text-sm text-gray-500 mt-2">Or contact admin for a custom plan</p>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    if (plan.is_expired) return 'text-red-600 bg-red-100';
    if (plan.days_remaining !== null && plan.days_remaining <= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusText = () => {
    if (plan.is_expired) return 'Expired';
    if (plan.days_remaining !== null && plan.days_remaining <= 7) return `${plan.days_remaining} days left`;
    return 'Active';
  };

  const getLimitColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
              <p className="text-gray-600">{plan.description}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {plan.is_free ? 'Free' : `₹${plan.price}`}
            </div>
            <div className="text-sm text-gray-600">
              {plan.is_free ? 'Plan' : `per ${plan.duration_type}`}
            </div>
          </div>
          
          {plan.start_date && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {new Date(plan.start_date).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600">Start Date</div>
            </div>
          )}
          
          {plan.end_date && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {new Date(plan.end_date).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600">End Date</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Usage Limits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage & Limits</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Turfs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Turfs</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLimitColor(plan.limits.turfs.current, plan.limits.turfs.max)}`}>
                {plan.limits.turfs.current}/{plan.limits.turfs.max}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(plan.limits.turfs.current / plan.limits.turfs.max) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {plan.limits.turfs.remaining} remaining
            </div>
          </div>

          {/* Staff */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Staff</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLimitColor(plan.limits.staff.current, plan.limits.staff.max)}`}>
                {plan.limits.staff.current}/{plan.limits.staff.max}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(plan.limits.staff.current / plan.limits.staff.max) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {plan.limits.staff.remaining} remaining
            </div>
          </div>

          {/* Bookings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Monthly Bookings</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLimitColor(plan.limits.bookings.current, plan.limits.bookings.max)}`}>
                {plan.limits.bookings.current}/{plan.limits.bookings.max}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(plan.limits.bookings.current / plan.limits.bookings.max) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {plan.limits.bookings.remaining} remaining this month
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plan.features && plan.features.length > 0 ? (
            plan.features.map((feature) => (
              <div key={feature.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">{feature.name}</div>
                  <div className="text-sm text-gray-600">{feature.description}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No features available in your current plan
            </div>
          )}
        </div>
      </motion.div>

      {/* Upgrade Notice */}
      {(plan.is_expired || (plan.days_remaining !== null && plan.days_remaining <= 7)) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-6"
        >
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-yellow-600" />
            <div>
              <h4 className="font-semibold text-yellow-800">
                {plan.is_expired ? 'Plan Expired' : 'Plan Expiring Soon'}
              </h4>
              <p className="text-yellow-700">
                {plan.is_expired 
                  ? 'Your plan has expired. Contact admin to renew your subscription.'
                  : `Your plan will expire in ${plan.days_remaining} days. Contact admin to renew.`
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CurrentPlan;