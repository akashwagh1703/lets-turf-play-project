import React, { useState, useEffect } from 'react';
import { X, Check, Crown, Star, Zap, CreditCard } from 'lucide-react';
import { apiService } from '../services/api';

const UpgradeModal = ({ isOpen, onClose, currentPlan, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [fetchingPlans, setFetchingPlans] = useState(true);
  const [showTestPayment, setShowTestPayment] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      setFetchingPlans(true);
      
      // Fetch all revenue models
      const plansResponse = await apiService.getRevenueModels();
      const revenueModels = plansResponse.data?.data || plansResponse.data || [];
      
      console.log('Revenue models fetched:', revenueModels);
      
      // Fetch all features
      let allFeatures = [];
      try {
        const featuresResponse = await apiService.getFeatures();
        allFeatures = featuresResponse.data?.data || featuresResponse.data || [];
        console.log('Features fetched:', allFeatures);
      } catch (featuresError) {
        console.warn('Failed to fetch features:', featuresError);
      }
      
      // Map features to plans
      const plansWithFeatures = revenueModels.map(plan => ({
        ...plan,
        features: plan.selected_features && Array.isArray(plan.selected_features)
          ? allFeatures.filter(feature => plan.selected_features.includes(feature.id))
          : []
      }));
      
      console.log('Plans with features:', plansWithFeatures);
      
      setPlans(plansWithFeatures);
      if (plansWithFeatures.length > 0 && !selectedPlan) {
        setSelectedPlan(plansWithFeatures[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      alert('Failed to load plans. Please try again.');
    } finally {
      setFetchingPlans(false);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const selectedPlanData = plans.find(p => p.id === selectedPlan);
      if (!selectedPlanData) return;
      
      if (selectedPlanData.is_free || selectedPlanData.price === 0) {
        // Direct upgrade for free plans
        await onUpgrade(selectedPlan);
        onClose();
        return;
      }
      
      // Show test payment gateway
      setShowTestPayment(true);
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTestPayment = async () => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock payment response
      const mockPaymentData = {
        payment_id: 'pay_test_' + Date.now(),
        order_id: 'order_test_' + Date.now(),
        signature: 'test_signature_' + Date.now()
      };
      
      await onUpgrade(selectedPlan, mockPaymentData);
      setShowTestPayment(false);
      onClose();
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Upgrade Your Plan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {fetchingPlans ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading plans...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = currentPlan === plan.name.toLowerCase();
              return (
                <div
                  key={plan.id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all relative ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isCurrentPlan ? 'border-green-500 bg-green-50' : ''}`}
                  onClick={() => !isCurrentPlan && setSelectedPlan(plan.id)}
                >
                  {isCurrentPlan && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Current
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    {plan.name.toLowerCase().includes('premium') && <Star className="text-yellow-500" size={20} />}
                    {plan.name.toLowerCase().includes('enterprise') && <Crown className="text-purple-500" size={20} />}
                  </div>
                  
                  <div className="text-3xl font-bold mb-4">
                    ₹{plan.price}
                    <span className="text-sm text-gray-500">/{plan.duration_type}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Turfs</span>
                      <span className="font-semibold">{plan.max_turfs === -1 ? 'Unlimited' : plan.max_turfs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Staff</span>
                      <span className="font-semibold">{plan.max_staff === -1 ? 'Unlimited' : plan.max_staff}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Bookings</span>
                      <span className="font-semibold">{plan.max_bookings_per_month === -1 ? 'Unlimited' : plan.max_bookings_per_month}</span>
                    </div>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
                      <div className="space-y-1">
                        {plan.features.slice(0, 4).map((feature) => (
                          <div key={feature.id} className="flex items-center">
                            <Check size={14} className="text-green-500 mr-2 flex-shrink-0" />
                            <span className="text-xs text-gray-600">{feature.name}</span>
                          </div>
                        ))}
                        {plan.features.length > 4 && (
                          <div className="text-xs text-gray-500">+{plan.features.length - 4} more features</div>
                        )}
                      </div>
                    </div>
                  )}

                  {plan.description && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500">{plan.description}</p>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="mt-4 text-center">
                      <div className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                        ✓ Active Plan
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            disabled={loading || !selectedPlan || (selectedPlan && plans.find(p => p.id === selectedPlan && currentPlan === p.name.toLowerCase()))}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <Zap size={16} className="mr-2 animate-spin" />
            ) : (
              <CreditCard size={16} className="mr-2" />
            )}
            {loading ? 'Processing...' : (
              selectedPlan ? (
                (() => {
                  const selected = plans.find(p => p.id === selectedPlan);
                  const isCurrent = selected && currentPlan === selected.name.toLowerCase();
                  if (isCurrent) return 'Current Plan';
                  return selected?.is_free || selected?.price === 0 ? 'Upgrade Free' : `Pay ₹${selected?.price || 0}`;
                })()
              ) : 'Select Plan'
            )}
          </button>
        </div>
        
        {/* Test Payment Gateway Modal */}
        {showTestPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Test Payment Gateway</h3>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Plan: {plans.find(p => p.id === selectedPlan)?.name}</p>
                <p className="text-2xl font-bold text-blue-600">₹{plans.find(p => p.id === selectedPlan)?.price}</p>
              </div>
              
              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    💳 This is a test payment gateway. Click "Pay Now" to simulate successful payment.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTestPayment(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTestPayment}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpgradeModal;