import React, { useState } from 'react';
import Modal from 'react-modal';
import { motion } from 'framer-motion';
import { CreditCard, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentGateway = ({ isOpen, onClose, plan, billingCycle, onSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const amount = billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price;

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const paymentData = {
        method: paymentMethod,
        amount: amount,
        currency: 'INR',
        transaction_id: `txn_${Date.now()}`,
        status: 'success'
      };
      
      onSuccess(paymentData);
      setProcessing(false);
      toast.success('Payment successful!');
    }, 2000);
  };

  if (!plan) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="max-w-md mx-auto mt-20 bg-white rounded-2xl shadow-2xl overflow-hidden outline-none"
      overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">{plan.name}</span>
            <span className="font-bold">₹{amount}</span>
          </div>
          <div className="text-sm text-gray-600">
            {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} subscription
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <CreditCard size={20} className="mr-2" />
                <span>Credit/Debit Card</span>
              </label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>UPI</span>
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Check size={20} className="mr-2" />
              Pay ₹{amount}
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment powered by Razorpay
        </p>
      </div>
    </Modal>
  );
};

export default PaymentGateway;