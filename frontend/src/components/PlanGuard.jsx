import React from 'react';
import { Lock, Crown, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import usePlanRestrictions from '../hooks/usePlanRestrictions';

const PlanGuard = ({ 
  children, 
  feature = null, 
  resource = null, 
  fallback = null,
  showUpgradeMessage = true 
}) => {
  const { user } = useAuth();
  const { hasFeature, canAddMore, isExpired } = usePlanRestrictions();

  // Super admin and staff bypass all restrictions
  if (user?.role === 'super_admin' || user?.role === 'staff') {
    return children;
  }

  // For turf owners, check restrictions
  if (user?.role === 'turf_owner') {
    // Check if plan is expired
    if (isExpired()) {
      return fallback || (showUpgradeMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="font-medium text-red-800">Plan Expired</h4>
              <p className="text-sm text-red-600">Your plan has expired. Contact admin to renew.</p>
            </div>
          </div>
        </div>
      ));
    }

    // Check feature access
    if (feature && !hasFeature(feature)) {
      return fallback || (showUpgradeMessage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">Feature Not Available</h4>
              <p className="text-sm text-yellow-600">
                {feature} is not available in your current plan. Upgrade to access this feature.
              </p>
            </div>
          </div>
        </div>
      ));
    }

    // Check resource limits
    if (resource && !canAddMore(resource)) {
      return fallback || (showUpgradeMessage && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Crown className="w-5 h-5 text-orange-600" />
            <div>
              <h4 className="font-medium text-orange-800">Limit Reached</h4>
              <p className="text-sm text-orange-600">
                You've reached your {resource} limit. Upgrade your plan to add more.
              </p>
            </div>
          </div>
        </div>
      ));
    }
  }

  return children;
};

export default PlanGuard;