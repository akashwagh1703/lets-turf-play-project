import React, { useState } from 'react';
import { CreditCard, Smartphone, Building2, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const PaymentGateway = ({ booking, onSuccess, onCancel }) => {
  const [selectedGateway, setSelectedGateway] = useState('razorpay');
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const gateways = [
    { id: 'razorpay', name: 'Razorpay', icon: CreditCard },
    { id: 'stripe', name: 'Stripe', icon: CreditCard },
    { id: 'payu', name: 'PayU', icon: Building2 }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'upi', name: 'UPI', icon: Smartphone },
    { id: 'netbanking', name: 'Net Banking', icon: Building2 }
  ];

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError('');

      const response = await api.post('/payments/create', {
        booking_id: booking.id,
        payment_method: selectedMethod,
        gateway: selectedGateway
      });

      // Simulate payment processing
      if (selectedGateway === 'razorpay') {
        await processRazorpay(response.data.gateway_response);
      } else if (selectedGateway === 'stripe') {
        await processStripe(response.data.gateway_response);
      } else {
        await processPayU(response.data.gateway_response);
      }

    } catch (error) {
      setError(error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const processRazorpay = async (gatewayData) => {
    // Simulate Razorpay payment
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        if (success) {
          onSuccess({
            gateway: 'razorpay',
            transaction_id: gatewayData.order_id,
            amount: booking.total_amount
          });
        } else {
          setError('Payment failed. Please try again.');
        }
        resolve();
      }, 2000);
    });
  };

  const processStripe = async (gatewayData) => {
    // Simulate Stripe payment
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1;
        if (success) {
          onSuccess({
            gateway: 'stripe',
            transaction_id: gatewayData.client_secret,
            amount: booking.total_amount
          });
        } else {
          setError('Payment failed. Please try again.');
        }
        resolve();
      }, 2000);
    });
  };

  const processPayU = async (gatewayData) => {
    // Simulate PayU payment
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1;
        if (success) {
          onSuccess({
            gateway: 'payu',
            transaction_id: gatewayData.txnid,
            amount: booking.total_amount
          });
        } else {
          setError('Payment failed. Please try again.');
        }
        resolve();
      }, 2000);
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Complete Payment</h3>
      
      <div className="mb-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium">{booking.turf?.turf_name}</h4>
          <p className="text-sm text-gray-600">
            {booking.date} • {booking.time_slots?.join(', ')}
          </p>
          <p className="text-lg font-semibold text-green-600 mt-2">
            ₹{booking.total_amount}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Payment Gateway</label>
        <div className="grid grid-cols-3 gap-2">
          {gateways.map((gateway) => {
            const Icon = gateway.icon;
            return (
              <button
                key={gateway.id}
                onClick={() => setSelectedGateway(gateway.id)}
                className={`p-3 border rounded-lg flex flex-col items-center ${
                  selectedGateway === gateway.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{gateway.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Payment Method</label>
        <div className="space-y-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full p-3 border rounded-lg flex items-center ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span>{method.name}</span>
                {selectedMethod === method.id && (
                  <CheckCircle className="h-5 w-5 ml-auto text-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <XCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          disabled={processing}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {processing ? 'Processing...' : `Pay ₹${booking.total_amount}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentGateway;