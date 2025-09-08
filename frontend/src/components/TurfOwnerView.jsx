import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, User, Mail, Phone, Building, MapPin, CreditCard, Calendar, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

const TurfOwnerView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [owner, setOwner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOwner = async () => {
      if (!id) {
        console.error('No owner ID provided');
        setError('No owner ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔍 Fetching owner with ID:', id);
        const response = await apiService.getTurfOwner(id);
        console.log('📡 Full API Response:', response);
        console.log('📊 Response Status:', response.status);
        console.log('📋 Response Data:', response.data);
        
        // Handle different response structures
        const ownerData = response?.data?.data || response?.data;
        console.log('👤 Extracted Owner Data:', ownerData);
        
        if (ownerData && ownerData.id) {
          setOwner(ownerData);
          console.log('✅ Owner data set successfully');
        } else {
          console.error('❌ Owner data not found or invalid in response');
          setError('Owner data not found in response');
        }
      } catch (err) {
        console.error('💥 Error fetching owner:', err);
        console.error('📄 Error response:', err.response);
        console.error('📝 Error message:', err.message);
        setError(err.response?.data?.message || err.message || 'Failed to load owner');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwner();
  }, [id]);

  if (isLoading) {
    console.log('⏳ Loading state - showing spinner');
    return (
      <div className="h-full bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading owner details... (ID: {id})</p>
        </div>
      </div>
    );
  }

  if (error || (!isLoading && !owner)) {
    console.log('❌ Error state or no owner found:', { error, owner, isLoading });
    return (
      <div className="h-full bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle size={64} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error ? 'Error Loading Owner' : 'Owner Not Found'}
          </h2>
          <p className="text-gray-600 mb-2">
            {error || 'The requested turf owner could not be found.'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Owner ID: {id}
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => navigate('/admin/owners')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Owners
            </button>
            {error && (
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <RefreshCw size={16} />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const InfoCard = ({ title, children, icon: Icon, color = "text-blue-600" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Icon className={color} size={20} />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </motion.div>
  );

  const StatCard = ({ label, value, color = "text-gray-900" }) => (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );

  console.log('✅ Rendering owner view with data:', owner);
  
  return (
    <div className="h-full bg-gray-50/30 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/owners')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  navigate('/admin/owners');
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Owners"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{owner?.name?.charAt(0) || 'U'}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{owner?.name || 'Unknown'}</h1>
                <p className="text-gray-600">{owner?.email || 'No email'}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    owner?.status 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {owner?.status ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Member since {owner?.created_at ? new Date(owner.created_at).getFullYear() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/admin/owners/edit/${id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                navigate(`/admin/owners/edit/${id}`);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Edit size={16} />
            <span>Edit Owner</span>
          </button>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard label="Total Turfs" value={owner?.turfs?.length || 0} color="text-blue-600" />
            <StatCard label="Active Bookings" value="0" color="text-green-600" />
            <StatCard label="Monthly Revenue" value="₹0" color="text-purple-600" />
            <StatCard label="Staff Members" value="0" color="text-orange-600" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <InfoCard title="Personal Information" icon={User}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900 font-medium">{owner?.name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <div className="flex items-center space-x-2">
                  <Mail size={16} className="text-gray-400" />
                  <p className="text-gray-900">{owner?.email || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <div className="flex items-center space-x-2">
                  <Phone size={16} className="text-gray-400" />
                  <p className="text-gray-900">{owner?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Account Created</label>
                <p className="text-gray-900">
                  {owner?.created_at ? new Date(owner.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Not available'}
                </p>
              </div>
            </div>
          </InfoCard>

          {/* Business Information */}
          <InfoCard title="Business Information" icon={Building} color="text-green-600">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">Business Name</label>
                  <p className="text-gray-900 font-medium">{owner?.business_name || 'Not provided'}</p>
                </div>
                {owner?.business_logo && (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center ml-4">
                    <img src={owner.business_logo} alt="Business Logo" className="w-full h-full object-cover rounded-lg" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Business Type</label>
                <p className="text-gray-900 capitalize">{owner?.business_type || 'Not specified'}</p>
              </div>
              {owner?.business_description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Description</label>
                  <p className="text-gray-900 leading-relaxed">{owner.business_description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Business Address</label>
                <div className="flex items-start space-x-2">
                  <MapPin size={16} className="text-gray-400 mt-0.5" />
                  <p className="text-gray-900">{owner?.business_address || 'Not provided'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">GST Number</label>
                  <p className="text-gray-900">{owner?.gst_number || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">PAN Number</label>
                  <p className="text-gray-900">{owner?.pan_number || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </InfoCard>

          {/* Banking Information */}
          <InfoCard title="Banking Information" icon={CreditCard} color="text-purple-600">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Bank Account Number</label>
                <p className="text-gray-900 font-mono">
                  {owner?.bank_account ? `****${owner.bank_account.toString().slice(-4)}` : 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                <p className="text-gray-900 font-mono">{owner?.bank_ifsc || 'Not provided'}</p>
              </div>
            </div>
          </InfoCard>

          {/* Subscription Information */}
          <InfoCard title="Subscription Plan" icon={Calendar} color="text-orange-600">
            <div className="space-y-4">
              {owner?.subscriptions && owner.subscriptions.length > 0 ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Current Plan</label>
                    <p className="text-gray-900 font-medium">
                      {owner.subscriptions[0]?.revenue_model?.name || 'Unknown Plan'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Commission Rate</label>
                    <div className="flex items-center space-x-2">
                      <TrendingUp size={16} className="text-green-500" />
                      <p className="text-gray-900">
                        {owner.subscriptions[0]?.revenue_model?.commission_rate || 0}%
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Plan Price</label>
                    <p className="text-gray-900">
                      ₹{owner.subscriptions[0]?.revenue_model?.price || 0}/
                      {owner.subscriptions[0]?.revenue_model?.billing_cycle || 'month'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Subscription Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      owner.subscriptions[0]?.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {owner.subscriptions[0]?.status || 'Unknown'}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 italic">No active subscription</p>
              )}
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default TurfOwnerView;