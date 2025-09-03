import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Calendar, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiService } from '../services/api';

const SubscriptionHistory = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await apiService.getMySubscriptions();
      setSubscriptions(response.data);
    } catch (error) {
      toast.error('Failed to fetch subscription history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'expired': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Subscription History</h3>
        <p className="text-sm text-gray-600">Your past and current subscriptions</p>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No subscription history found</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {subscriptions.map((subscription, index) => (
            <motion.div
              key={subscription.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(subscription.status)}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {subscription.revenue_model?.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {subscription.revenue_model?.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {new Date(subscription.start_date).toLocaleDateString()} - {new Date(subscription.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="capitalize">{subscription.billing_cycle}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    ₹{subscription.amount}
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                    {subscription.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionHistory;