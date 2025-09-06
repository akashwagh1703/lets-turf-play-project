import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const usePlanRestrictions = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'turf_owner') {
      fetchPlan();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPlan = async () => {
    try {
      const response = await apiService.getMyPlan();
      setPlan(response.data?.plan);
    } catch (error) {
      console.error('Failed to fetch plan:', error);
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureName) => {
    if (!plan || !plan.features) return false;
    return plan.features.some(feature => feature.name === featureName);
  };

  const canAddMore = (resource) => {
    if (!plan || !plan.limits) return false;
    
    switch (resource) {
      case 'turfs':
        return plan.limits.turfs.remaining > 0;
      case 'staff':
        return plan.limits.staff.remaining > 0;
      case 'bookings':
        return plan.limits.bookings.remaining > 0;
      default:
        return false;
    }
  };

  const getUsage = (resource) => {
    if (!plan || !plan.limits) return { current: 0, max: 0, remaining: 0 };
    return plan.limits[resource] || { current: 0, max: 0, remaining: 0 };
  };

  const isExpired = () => {
    return plan?.is_expired || false;
  };

  const isExpiringSoon = () => {
    return plan?.days_remaining !== null && plan.days_remaining <= 7;
  };

  return {
    plan,
    loading,
    hasFeature,
    canAddMore,
    getUsage,
    isExpired,
    isExpiringSoon,
    refetch: fetchPlan
  };
};

export default usePlanRestrictions;