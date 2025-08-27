import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { sendOTP, verifyOTP } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/search';

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await sendOTP(phoneNumber);
      setStep('otp');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await verifyOTP(phoneNumber, otp);
      if (result.success) {
        if (result.isNewUser) {
          navigate('/onboarding', { state: { phoneNumber } });
        } else if (result.user) {
          login(result.user);
          navigate(from, { replace: true });
        }
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid grid-cols-1 lg:grid-cols-2">
      {/* Left Panel - Image and Welcome */}
      <div className="relative hidden lg:flex flex-col justify-end items-start p-12 bg-login-hero bg-cover bg-center">
        <div className="absolute inset-0 bg-dark/70" />
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        >
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
            <span className="text-white font-bold text-4xl">T</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Welcome to TurfBooker
          </h1>
          <p className="text-lg text-gray-300 mt-4">
            Your next match is just a few clicks away.
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex items-center justify-center p-4 lg:p-8">
        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 lg:hidden">
                <span className="text-white font-bold text-3xl">T</span>
              </div>
              <h1 className="text-2xl font-bold text-dark">
                {step === 'phone' ? 'Sign In or Sign Up' : 'Enter Verification Code'}
              </h1>
              <p className="text-foreground/80 mt-2">
                {step === 'phone'
                  ? 'Enter your phone number to get started.'
                  : `An OTP was sent to +91 ${phoneNumber}`}
              </p>
            </div>

            {step === 'phone' ? (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    error={error}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" isLoading={isLoading} variant="primary">
                  Send OTP
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <Input
                    label="One-Time Password"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    error={error}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" isLoading={isLoading} variant="primary">
                  Verify & Proceed
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            )}

            <div className="text-center mt-6">
              {step === 'otp' && (
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Change phone number
                </button>
              )}
              <p className="text-xs text-foreground/60 mt-4">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
              <p className="mt-2 text-sm text-foreground/80">Demo OTP: <span className="font-mono font-bold">123456</span></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
