import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export const apiService = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  
  getTurfs: (params = {}) => {
    const queryParams = { per_page: params.per_page || 10, include: 'owner', ...params };
    if (params.status && params.status !== 'all') {
      queryParams.status = params.status === 'active';
    }
    return api.get('/turfs', { params: queryParams });
  },
  createTurf: (data) => api.post('/turfs', data),
  updateTurf: (id, data) => api.put(`/turfs/${id}`, data),
  deleteTurf: (id) => api.delete(`/turfs/${id}`),
  
  getTurfOwners: (params = {}) => {
    const queryParams = { per_page: params.per_page || 10, include: 'turfs,subscriptions.revenueModel' };
    if (params.search) queryParams['filter[name]'] = params.search;
    if (params.status && params.status !== 'all') {
      queryParams['filter[status]'] = params.status === 'active';
    }
    if (params.page) queryParams.page = params.page;
    return api.get('/turf-owners', { params: queryParams });
  },
  createTurfOwner: (data) => api.post('/turf-owners', data),
  updateTurfOwner: (id, data) => api.put(`/turf-owners/${id}`, data),
  deleteTurfOwner: (id) => api.delete(`/turf-owners/${id}`),
  
  getRevenueModels: (params = {}) => {
    const queryParams = {};
    if (params.status && params.status !== 'all') {
      queryParams.status = params.status === 'active' ? 'true' : 'false';
    }
    if (params.type) queryParams.type = params.type;
    return api.get('/revenue-models', { params: queryParams });
  },
  createRevenueModel: (data) => api.post('/revenue-models', data),
  updateRevenueModel: (id, data) => api.put(`/revenue-models/${id}`, data),
  deleteRevenueModel: (id) => api.delete(`/revenue-models/${id}`),
  
  // Subscription APIs
  subscribeRevenueModel: (data) => api.post('/subscribe-revenue-model', data),
  getMySubscription: () => api.get('/my-subscription'),
  getMySubscriptions: () => api.get('/my-subscriptions'),
  
  // Admin subscription management
  getSubscriptions: (params = {}) => {
    const queryParams = { per_page: params.per_page || 10, include: 'user,revenueModel', ...params };
    if (params.status && params.status !== 'all') {
      queryParams.status = params.status;
    }
    if (params.search) queryParams['filter[user_name]'] = params.search;
    return api.get('/subscriptions', { params: queryParams });
  },
  updateSubscription: (id, data) => api.put(`/subscriptions/${id}`, data),
  deleteSubscription: (id) => api.delete(`/subscriptions/${id}`),
  
  // Subscription analytics
  getSubscriptionStats: () => api.get('/subscriptions/stats'),
  
  getPlayers: (params = {}) => {
    const queryParams = { per_page: params.per_page || 10, ...params };
    if (params.status && params.status !== 'all') {
      queryParams.status = params.status === 'active';
    }
    return api.get('/players', { params: queryParams });
  },
  createPlayer: (data) => api.post('/players', data),
  updatePlayer: (id, data) => api.put(`/players/${id}`, data),
  deletePlayer: (id) => api.delete(`/players/${id}`),
  
  getBookings: (params = {}) => api.get('/bookings', { params: { per_page: params.per_page || 10, include: params.include || 'turf,user', ...params } }),
  createBooking: (data) => api.post('/bookings', data),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),
  
  getStaff: (params = {}) => {
    const queryParams = { per_page: params.per_page || 10, include: params.include || 'owner', ...params };
    if (params.status && params.status !== 'all') {
      queryParams.status = params.status === 'active';
    }
    return api.get('/staff', { params: queryParams });
  },
  createStaff: (data) => api.post('/staff', data),
  updateStaff: (id, data) => api.put(`/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/staff/${id}`),
  
  getDashboardStats: () => api.get('/dashboard/stats', { headers: { 'Cache-Control': 'max-age=300' } }),
  getNotifications: () => api.get('/notifications'),
  
  // Analytics APIs
  getAdvancedAnalytics: (params = {}) => api.get('/analytics/advanced', { params }),
  getUserNotifications: (userId) => api.get(`/notifications/${userId}`),
  
  // Additional API methods
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
  
  // Turf stats
  getTurfStats: () => api.get('/turf-stats'),
  
  // Booking stats
  getBookingStats: () => api.get('/bookings-stats'),
  
  // Available slots
  getAvailableSlots: (turfId, date) => api.get(`/turfs/${turfId}/available-slots?date=${date}`),
  
  // Player analytics
  getPlayerAnalytics: () => api.get('/players/analytics'),
};

export default api;