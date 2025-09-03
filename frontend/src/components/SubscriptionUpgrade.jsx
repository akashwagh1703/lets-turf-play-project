import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Crown, Check, X, Zap, Shield, Star } from 'lucide-react';
import { apiService } from '../services/api';

const SubscriptionUpgrade = ({ onClose, currentPlan }) => {
  const [revenueModels, setRevenueModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchRevenueModels();
  }, []);

  const fetchRevenueModels = async () => {
    try {
      const response = await apiService.getRevenueModels();
      setRevenueModels(response.data.filter(model => model.name !== currentPlan));
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (model, billingCycle) => {
    try {
      setUpgrading(true);
      await apiService.subscribeRevenueModel({
        revenue_model_id: model.id,
        billing_cycle: billingCycle
      });
      toast.success('Plan upgraded successfully!');
      onClose();
      window.location.reload();
    } catch (error) {
      toast.error('Failed to upgrade plan');
    } finally {
      setUpgrading(false);
    }
  };

  const getPlanIcon = (type) => {
    switch (type) {
      case 'platform_only': return <Shield className="w-6 h-6" />;
      case 'platform_plus_commission': return <Crown className="w-6 h-6" />;
      case 'commission_only': return <Zap className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Upgrade Your Plan</h2>
              <p className="text-blue-100">Unlock more features and grow your business</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {revenueModels.map((model) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border-2 rounded-xl p-6 relative ${
                  model.is_popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {model.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex justify-center mb-3 text-blue-600">
                    {getPlanIcon(model.type)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{model.name}</h3>
                  <p className="text-gray-600 text-sm mt-2">{model.description}</p>
                </div>

                <div className="text-center mb-6">
                  {model.monthly_fee > 0 ? (
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        ₹{model.monthly_fee}<span className="text-lg font-normal text-gray-500">/month</span>
                      </div>
                      {model.yearly_fee > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          ₹{model.yearly_fee}/year (Save ₹{(model.monthly_fee * 12 - model.yearly_fee).toFixed(0)})
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-green-600">
                      {model.commission_percentage}% Commission
                    </div>
                  )}
                </div>

                {model.features && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                    <ul className="space-y-2">
                      {model.features.split(',').map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  {model.monthly_fee > 0 && (
                    <button
                      onClick={() => handleUpgrade(model, 'monthly')}
                      disabled={upgrading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {upgrading ? 'Upgrading...' : 'Upgrade Monthly'}
                    </button>
                  )}
                  {model.yearly_fee > 0 && (
                    <button
                      onClick={() => handleUpgrade(model, 'yearly')}
                      disabled={upgrading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {upgrading ? 'Upgrading...' : 'Upgrade Yearly'}
                    </button>
                  )}
                  {model.commission_percentage > 0 && model.monthly_fee === 0 && (
                    <button
                      onClick={() => handleUpgrade(model, 'monthly')}
                      disabled={upgrading}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {upgrading ? 'Upgrading...' : 'Switch to Commission'}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionUpgrade;