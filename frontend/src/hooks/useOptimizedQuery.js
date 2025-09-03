import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

export const useOptimizedQuery = (key, queryFn, options = {}) => {
  return useQuery(key, queryFn, {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    ...options,
  });
};

export const useOptimizedMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation(mutationFn, {
    onSuccess: (data, variables, context) => {
      if (options.invalidateQueries) {
        queryClient.invalidateQueries(options.invalidateQueries);
      }
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useTurfs = (params = {}) => {
  return useOptimizedQuery(['turfs', params], () => apiService.getTurfs(params));
};

export const useTurfOwners = (params = {}) => {
  return useOptimizedQuery(['turf-owners', params], () => apiService.getTurfOwners(params));
};

export const useRevenueModels = (params = {}) => {
  return useOptimizedQuery(['revenue-models', params], () => apiService.getRevenueModels(params));
};

export const usePlayers = (params = {}) => {
  return useOptimizedQuery(['players', params], () => apiService.getPlayers(params));
};

export const useBookings = (params = {}) => {
  return useOptimizedQuery(['bookings', params], () => apiService.getBookings(params));
};

export const useDashboardStats = () => {
  return useOptimizedQuery(['dashboard-stats'], () => apiService.getDashboardStats(), {
    staleTime: 2 * 60 * 1000,
  });
};