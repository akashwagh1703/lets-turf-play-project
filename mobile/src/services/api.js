import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout'),
};

export const turfAPI = {
  getTurfs: () => api.get('/turfs'),
  getTurf: (id) => api.get(`/turfs/${id}`),
  getAvailableSlots: (turfId, date) => api.get(`/turfs/${turfId}/available-slots?date=${date}`),
};

export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getBookings: () => api.get('/bookings'),
  getBooking: (id) => api.get(`/bookings/${id}`),
};

export const paymentAPI = {
  createPayment: (paymentData) => api.post('/payments/create', paymentData),
  getPayments: () => api.get('/payments'),
};

export default api;