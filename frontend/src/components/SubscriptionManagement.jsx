import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Modal from 'react-modal';
import { Crown, Check, X, Zap, Shield, Star, CreditCard } from 'lucide-react';
import { apiService } from '../services/api';
import SubscriptionHistory from './SubscriptionHistory';
import PaymentGateway from './PaymentGateway';

const SubscriptionManagement = () => {
  const [revenueModels, setRevenueModels] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showPayment, setShowPayment] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modelsResponse, subscriptionResponse] = await Promise.all([
        apiService.getRevenueModels().catch(() => ({ data: [] })),
        apiService.getMySubscription().catch(() => ({ data: { subscription: null } }))
      ]);
      
      const models = modelsResponse.data || [];
      if (models.length === 0) {
        // Set default plans if API fails
        setRevenueModels([
          {
            id: 1,
            name: 'Free Plan',
            description: 'Basic features for getting started',
            type: 'platform_only',
            monthly_fee: 0,
            yearly_fee: 0,
            commission_percentage: 0,
            features: 'Basic dashboard,1 turf management,Limited bookings',
            is_popular: false,
            status: true
          },
          {
            id: 2,
            name: 'Platform Only',
            description: 'Full platform access with monthly fee',
            type: 'platform_only',
            monthly_fee: 999,
            yearly_fee: 9999,
            commission_percentage: 0,
            features: 'Full dashboard,Up to 10 turfs,Up to 20 staff,Advanced analytics',
            is_popular: true,
            status: true
          },
          {
            id: 3,
            name: 'Platform+Commission',
            description: 'Platform access plus commission on bookings',
            type: 'platform_plus_commission',
            monthly_fee: 499,
            yearly_fee: 4999,
            commission_percentage: 5,
            features: 'Full dashboard,Unlimited turfs,Unlimited staff,Premium support',
            is_popular: false,
            status: true
          },
          {
            id: 4,
            name: 'Commission Only',
            description: 'Pay only commission on successful bookings',
            type: 'commission_only',
            monthly_fee: 0,
            yearly_fee: 0,
            commission_percentage: 10,
            features: 'Basic dashboard,Up to 5 turfs,Up to 10 staff,Standard support',
            is_popular: false,
            status: true
          }
        ]);
      } else {
        setRevenueModels(models);
      }
      setCurrentSubscription(subscriptionResponse.data?.subscription);
      
      // If no subscription, user is on free plan
      if (!subscriptionResponse.data?.subscription) {
        setCurrentSubscription({
          revenue_model: {
            name: 'Free Plan',
            description: 'Basic features for getting started'
          },
          status: 'active',
          billing_cycle: 'monthly',
          amount: 0,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    } catch (error) {
      console.error('Subscription data error:', error);
      toast.error('Failed to fetch subscription data');
      // Set default free plan
      setCurrentSubscription({
        revenue_model: {
          name: 'Free Plan',
          description: 'Basic features for getting started'
        },
        status: 'active',
        billing_cycle: 'monthly',
        amount: 0
      });
      // Set default plans on error
      setRevenueModels([
        {
          id: 1,
          name: 'Free Plan',
          description: 'Basic features for getting started',
          type: 'platform_only',
          monthly_fee: 0,
          yearly_fee: 0,
          commission_percentage: 0,
          features: 'Basic dashboard,1 turf management,Limited bookings',
          is_popular: false,
          status: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (model, cycle) => {
    setSelectedModel(model);
    setBillingCycle(cycle);
    if (model.name === 'Free Plan') {
      handleSubscribe(model, cycle);
    } else {
      setShowPayment(true);
    }
  };

  const handleSubscribe = async (model = selectedModel, cycle = billingCycle, paymentData = null) => {
    if (!model) return;

    try {
      setUpgrading(true);
      await apiService.subscribeRevenueModel({
        revenue_model_id: model.id,
        billing_cycle: cycle,
        payment_details: paymentData || {
          method: 'free',
          timestamp: new Date().toISOString()
        }
      });
      
      toast.success(`Successfully subscribed to ${model.name}`);
      setModalOpen(false);
      setShowPayment(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update plan');
      throw error;
    } finally {
      setUpgrading(false);
    }
  };

  const handlePayment = async (paymentData) => {
    setUpgrading(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      await handleSubscribe(selectedModel, billingCycle, paymentData);
      toast.success('Payment successful! Plan activated.');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    }
  };

  const getPrice = (model, cycle) => {
    if (model.type === 'commission_only') return 'Commission Only';
    return cycle === 'monthly' ? `₹${model.monthly_fee}/month` : `₹${model.yearly_fee}/year`;
  };

  const getSavings = (model) => {
    if (model.type === 'commission_only' || !model.yearly_fee || !model.monthly_fee) return null;
    const monthlyCost = model.monthly_fee * 12;
    const savings = monthlyCost - model.yearly_fee;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { amount: savings, percentage };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Subscription</h2>
        
        {currentSubscription?.revenue_model ? (
          <div className={`rounded-lg p-6 border-2 ${
            currentSubscription.status === 'active' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className={`text-xl font-bold ${
                    currentSubscription.status === 'active' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {currentSubscription.revenue_model.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentSubscription.status === 'active' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {currentSubscription.status.toUpperCase()}
                  </span>
                </div>
                <p className={`mb-3 ${
                  currentSubscription.status === 'active' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {currentSubscription.revenue_model.description}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Billing:</span>
                    <p className="text-gray-900 capitalize">{currentSubscription.billing_cycle}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Amount:</span>
                    <p className="text-gray-900">₹{currentSubscription.amount}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Started:</span>
                    <p className="text-gray-900">{new Date(currentSubscription.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Expires:</span>
                    <p className="text-gray-900">{new Date(currentSubscription.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Change Plan
                </button>
                {currentSubscription.status === 'active' && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
            <p className="text-gray-500 mb-6">Choose a plan to get started with premium features</p>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Choose a Plan
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Available Plans</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {revenueModels.map((model) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-2 rounded-lg p-6 relative ${
                currentSubscription?.revenue_model?.id === model.id
                  ? 'border-green-500 bg-green-50'
                  : model.is_popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {currentSubscription?.revenue_model?.id === model.id && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}
              {model.is_popular && currentSubscription?.revenue_model?.id !== model.id && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {model.name}
                </h4>
                
                <div className="mb-4">
                  {model.type === 'commission_only' ? (
                    <div className="text-2xl font-bold text-gray-900">
                      {model.commission_percentage}%
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{model.monthly_fee}<span className="text-sm font-normal">/month</span>
                      </div>
                      {model.yearly_fee && (
                        <div className="text-lg text-gray-600">
                          ₹{model.yearly_fee}<span className="text-sm">/year</span>
                          {getSavings(model) && (
                            <span className="text-green-600 text-sm ml-1">
                              (Save {getSavings(model).percentage}%)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4">{model.description}</p>

                {model.features && (
                  <div className="text-left mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Features:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {model.features.split(',').map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {model.commission_percentage > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      + {model.commission_percentage}% commission on bookings
                    </p>
                  </div>
                )}

                {currentSubscription?.revenue_model?.id === model.id ? (
                  <button className="w-full py-2 px-4 rounded-lg font-medium bg-gray-400 text-white cursor-not-allowed">
                    Current Plan
                  </button>
                ) : (
                  <div className="space-y-2">
                    {model.name === 'Free Plan' ? (
                      <button
                        onClick={() => handlePlanSelect(model, 'monthly')}
                        disabled={upgrading}
                        className="w-full py-2 px-4 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 text-white transition-colors disabled:opacity-50"
                      >
                        {upgrading ? 'Switching...' : 'Switch to Free'}
                      </button>
                    ) : (
                      <>
                        {model.monthly_fee > 0 && (
                          <button
                            onClick={() => handlePlanSelect(model, 'monthly')}
                            disabled={upgrading}
                            className="w-full py-2 px-4 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                          >
                            Select Monthly
                          </button>
                        )}
                        {model.yearly_fee > 0 && (
                          <button
                            onClick={() => handlePlanSelect(model, 'yearly')}
                            disabled={upgrading}
                            className="w-full py-2 px-4 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
                          >
                            Select Yearly
                          </button>
                        )}
                        {model.commission_percentage > 0 && model.monthly_fee === 0 && (
                          <button
                            onClick={() => handlePlanSelect(model, 'monthly')}
                            disabled={upgrading}
                            className="w-full py-2 px-4 rounded-lg font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50"
                          >
                            Select Commission
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="max-w-md mx-auto mt-20 bg-white rounded-lg shadow-xl p-6"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center"
      >
        {selectedModel && (
          <>
            <h3 className="text-xl font-bold mb-4">Subscribe to {selectedModel.name}</h3>
            
            {selectedModel.type !== 'commission_only' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Cycle
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="monthly"
                      checked={billingCycle === 'monthly'}
                      onChange={(e) => setBillingCycle(e.target.value)}
                      className="mr-2"
                    />
                    <span>Monthly - ₹{selectedModel.monthly_fee}/month</span>
                  </label>
                  {selectedModel.yearly_fee && (
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="yearly"
                        checked={billingCycle === 'yearly'}
                        onChange={(e) => setBillingCycle(e.target.value)}
                        className="mr-2"
                      />
                      <span>
                        Yearly - ₹{selectedModel.yearly_fee}/year
                        {getSavings(selectedModel) && (
                          <span className="text-green-600 ml-1">
                            (Save ₹{getSavings(selectedModel).amount})
                          </span>
                        )}
                      </span>
                    </label>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Plan Summary:</h4>
              <p className="text-sm text-gray-600 mb-2">{selectedModel.description}</p>
              <p className="text-lg font-semibold text-gray-900">
                {getPrice(selectedModel, billingCycle)}
              </p>
              {selectedModel.commission_percentage > 0 && (
                <p className="text-sm text-yellow-700 mt-1">
                  + {selectedModel.commission_percentage}% commission on bookings
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubscribe}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Subscribe
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Payment Gateway Modal */}
      {showPayment && selectedModel && (
        <PaymentGateway
          selectedModel={selectedModel}
          billingCycle={billingCycle}
          onPayment={handlePayment}
          onCancel={() => setShowPayment(false)}
          upgrading={upgrading}
        />
      )}

      <SubscriptionHistory />
    </div>
  );
};

export default SubscriptionManagement;