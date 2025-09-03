import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Crown, Check, Star, Zap, Users, Building, Shield, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';
import PaymentGateway from './PaymentGateway';

const TurfOwnerSubscription = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get subscription data from API
      const response = await apiService.getMySubscriptions();
      const data = response.data;
      
      setCurrentPlan(data.current_subscription);
      
      // Transform API plans to frontend format
      const transformedPlans = data.available_plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        monthly_price: parseFloat(plan.monthly_price),
        yearly_price: parseFloat(plan.yearly_price),
        commission_rate: parseFloat(plan.commission_rate || 0),
        features_array: plan.features_array || [],
        yearly_discount: plan.yearly_discount || 0,
        is_popular: plan.is_popular,
        type: plan.type,
        turf_limit: plan.turf_limit,
        staff_limit: plan.staff_limit,
        booking_limit: plan.booking_limit,
        icon: plan.type === 'subscription' ? <Building className="w-5 h-5" /> : 
              plan.type === 'commission' ? <Zap className="w-5 h-5" /> : <Users className="w-5 h-5" />,
        color: plan.is_popular ? 'green' : plan.type === 'commission' ? 'purple' : 'blue'
      }));
      
      setPlans(transformedPlans);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      toast.error('Failed to load subscription data');
      // Set fallback data
      setCurrentPlan(null);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan, cycle) => {
    if (plan.name === 'Free Plan') {
      handleSubscribe(plan, cycle);
    } else {
      setSelectedPlan(plan);
      setBillingCycle(cycle);
      setShowPayment(true);
    }
  };

  const handleSubscribe = async (plan = selectedPlan, cycle = billingCycle, paymentData = null) => {
    try {
      const response = await apiService.post('/subscribe-revenue-model', {
        revenue_model_id: plan.id,
        billing_cycle: cycle
      });
      
      toast.success(`Successfully subscribed to ${plan.name}`);
      setShowPayment(false);
      fetchData();
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error.response?.data?.message || 'Failed to update subscription');
      throw error;
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    handleSubscribe(selectedPlan, billingCycle, paymentData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const colorClasses = {
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', button: 'bg-gray-600 hover:bg-gray-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', button: 'bg-blue-600 hover:bg-blue-700' },
    green: { bg: 'bg-green-50', border: 'border-green-200', button: 'bg-green-600 hover:bg-green-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', button: 'bg-purple-600 hover:bg-purple-700' }
  };

  const getSavings = (monthly, yearly) => {
    if (!monthly || !yearly) return 0;
    return Math.round((1 - yearly / (monthly * 12)) * 100);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Compact Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
            <p className="text-gray-600 text-sm">Choose the right plan for your business</p>
          </div>
          
          {/* Current Plan Badge */}
          {currentPlan && (
            <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <Crown className="w-4 h-4 mr-1" />
              <span className="font-medium">
                {currentPlan?.revenue_model?.name || 'Free Starter'}
              </span>
            </div>
          )}
        </div>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center bg-white rounded-lg p-1 w-fit mx-auto">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            {billingCycle === 'yearly' && (
              <span className="ml-1 text-xs bg-green-500 text-white px-1 rounded">Save 17%</span>
            )}
          </button>
        </div>
      </div>

      {/* Compact Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price;
          const isCurrentPlan = currentPlan?.revenue_model_id === plan.id;
          const colors = colorClasses[plan.color];
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                plan.is_popular 
                  ? 'border-green-500 shadow-md' 
                  : isCurrentPlan
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Badges */}
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg ${
                  plan.color === 'gray' ? 'bg-gray-100 text-gray-600' :
                  plan.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  plan.color === 'green' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {plan.icon}
                </div>
                
                {plan.is_popular && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Popular
                  </span>
                )}
                {isCurrentPlan && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Current
                  </span>
                )}
              </div>

              {/* Plan Info */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-gray-600 text-xs mb-3">{plan.description}</p>
                
                {/* Pricing */}
                {plan.commission_rate > 0 && price === 0 ? (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {plan.commission_rate}%
                    </div>
                    <div className="text-xs text-gray-500">commission</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">₹{price}</div>
                    <div className="text-xs text-gray-500">/{billingCycle === 'monthly' ? 'month' : 'year'}</div>
                    {plan.commission_rate > 0 && (
                      <div className="text-xs text-orange-600 mt-1">
                        +{plan.commission_rate}% commission
                      </div>
                    )}
                    {billingCycle === 'yearly' && plan.yearly_discount > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        Save {plan.yearly_discount}%
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Key Features - Compact */}
              <div className="space-y-2 mb-4">
                {plan.features_array.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
                {plan.features_array.length > 4 && (
                  <div className="text-blue-600 text-xs font-medium">
                    +{plan.features_array.length - 4} more
                  </div>
                )}
              </div>

              {/* Quick Limits */}
              <div className="bg-gray-50 rounded-lg p-2 mb-4">
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="text-gray-500">Turfs: <span className="font-medium text-gray-700">{plan.turf_limit || 'Unlimited'}</span></div>
                  <div className="text-gray-500">Staff: <span className="font-medium text-gray-700">{plan.staff_limit || 'Unlimited'}</span></div>
                </div>
              </div>

              {/* CTA Button */}
              {isCurrentPlan ? (
                <button className="w-full py-2 px-3 rounded-lg text-gray-600 font-medium bg-gray-200 cursor-not-allowed text-sm">
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handlePlanSelect(plan, billingCycle)}
                  className={`w-full py-2 px-3 rounded-lg text-white font-medium transition-colors text-sm ${colors.button}`}
                >
                  {price === 0 && plan.commission_rate === 0 ? 'Start Free' : 'Select Plan'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {showPayment && selectedPlan && (
        <PaymentGateway
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          plan={selectedPlan}
          billingCycle={billingCycle}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default TurfOwnerSubscription;