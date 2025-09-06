import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Users, Calendar, DollarSign, TrendingUp, Crown, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { apiService } from '../services/api';
import CountUp from 'react-countup';
import UpgradeModal from '../components/UpgradeModal';

const TurfOwnerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [planInfo, setPlanInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, planRes] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getMyPlan()
      ]);
      setStats(statsRes.data || {});
      setPlanInfo(planRes.data?.plan);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, prefix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {prefix}<CountUp end={value || 0} duration={1} />
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const PlanCard = () => {
    if (!planInfo) return null;
    
    const isPremium = !planInfo.is_free;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-4 shadow-lg border relative overflow-hidden ${
          isPremium 
            ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white border-purple-300' 
            : 'bg-white border-gray-200'
        }`}
      >
        {isPremium && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse"></div>
        )}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
              isPremium ? 'bg-white/20 backdrop-blur-sm' : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}>
              <Crown className={`w-6 h-6 ${isPremium ? 'text-white' : 'text-white'}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`font-bold ${isPremium ? 'text-white' : 'text-gray-900'}`}>{planInfo.name}</h3>
                {isPremium && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">✨ Premium</span>}
              </div>
              <p className={`text-sm ${isPremium ? 'text-purple-100' : 'text-gray-500'}`}>₹{planInfo.price}/month</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={`px-2 py-1 rounded-lg ${isPremium ? 'bg-white/10' : 'bg-gray-50'}`}>
                <p className={`text-xs ${isPremium ? 'text-purple-200' : 'text-gray-500'}`}>Turfs</p>
                <p className={`text-sm font-bold ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                  {planInfo.limits?.turfs?.current || 0}/{planInfo.limits?.turfs?.max === -1 ? '∞' : planInfo.limits?.turfs?.max || 0}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-lg ${isPremium ? 'bg-white/10' : 'bg-gray-50'}`}>
                <p className={`text-xs ${isPremium ? 'text-purple-200' : 'text-gray-500'}`}>Staff</p>
                <p className={`text-sm font-bold ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                  {planInfo.limits?.staff?.current || 0}/{planInfo.limits?.staff?.max === -1 ? '∞' : planInfo.limits?.staff?.max || 0}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-lg ${isPremium ? 'bg-white/10' : 'bg-gray-50'}`}>
                <p className={`text-xs ${isPremium ? 'text-purple-200' : 'text-gray-500'}`}>Bookings</p>
                <p className={`text-sm font-bold ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                  {planInfo.limits?.bookings?.current || 0}/{planInfo.limits?.bookings?.max === -1 ? '∞' : planInfo.limits?.bookings?.max || 0}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                isPremium 
                  ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isPremium ? 'Manage Plan' : 'Upgrade'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const handleUpgrade = async (selectedPlanId, paymentData = null) => {
    try {
      console.log('Starting upgrade process:', { selectedPlanId, paymentData });
      
      if (paymentData) {
        console.log('Verifying payment...');
        const verifyResponse = await apiService.verifyPayment({
          ...paymentData,
          plan_id: selectedPlanId
        });
        console.log('Payment verification response:', verifyResponse);
        
        if (verifyResponse.data.success) {
          console.log('Payment verified, upgrading plan...');
          const upgradeResponse = await apiService.upgradePlan(selectedPlanId);
          console.log('Upgrade response:', upgradeResponse);
          
          await fetchDashboardData();
          alert('Payment successful! Your plan has been upgraded.');
        } else {
          throw new Error('Payment verification failed');
        }
      } else {
        console.log('Direct upgrade for free plan...');
        const upgradeResponse = await apiService.upgradePlan(selectedPlanId);
        console.log('Upgrade response:', upgradeResponse);
        
        await fetchDashboardData();
        alert('Plan upgraded successfully!');
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      console.error('Error details:', error.response?.data);
      alert('Upgrade failed: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

        {/* Active Plan Card */}
        {planInfo && <PlanCard />}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="My Turfs" value={stats.my_turfs} icon={Building} color="bg-blue-500" />
          <StatCard title="Total Bookings" value={stats.my_bookings} icon={Calendar} color="bg-green-500" />
          <StatCard title="Monthly Revenue" value={stats.monthly_earnings} icon={DollarSign} color="bg-purple-500" prefix="₹" />
          <StatCard title="My Staff" value={stats.my_staff} icon={Users} color="bg-orange-500" />
        </div>
        
        {/* Booking Status Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.confirmed_bookings || 0}</p>
              <p className="text-sm text-gray-600">Confirmed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending_bookings || 0}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.cancelled_bookings || 0}</p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/owner/turfs')}
              className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <Building className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="font-medium text-blue-600">My Turfs</p>
              <p className="text-sm text-gray-500">{stats.my_turfs || 0} turfs managed</p>
            </button>
            
            <button 
              onClick={() => navigate('/owner/bookings')}
              className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
            >
              <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-green-600">View Bookings</p>
              <p className="text-sm text-gray-500">{stats.my_bookings || 0} total bookings</p>
            </button>
            
            <button 
              onClick={() => navigate('/owner/staff')}
              className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
            >
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="font-medium text-purple-600">Manage Staff</p>
              <p className="text-sm text-gray-500">{stats.my_staff || 0} staff members</p>
            </button>
            
            {/* Advanced Analytics - Plan Based */}
            {planInfo?.features?.some(f => f.name === 'Advanced Analytics') ? (
              <button 
                onClick={() => navigate('/owner/analytics')}
                className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-center text-white shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-pulse"></div>
                <div className="relative z-10">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-bold">Advanced Analytics</p>
                  <p className="text-xs opacity-90">✨ Premium Feature</p>
                </div>
              </button>
            ) : (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center opacity-60">
                <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-medium text-gray-500">Advanced Analytics</p>
                <p className="text-xs text-gray-400">Upgrade plan to unlock</p>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Upgrade Modal */}
        <UpgradeModal 
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={planInfo?.name?.toLowerCase()}
          onUpgrade={handleUpgrade}
        />
      </div>
    </div>
  );
};

export default TurfOwnerDashboard;