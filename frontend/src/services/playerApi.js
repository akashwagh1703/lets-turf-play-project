import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/player';

const playerApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
playerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('playerToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
playerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('playerToken');
      localStorage.removeItem('playerData');
      window.location.href = '/player/login';
    }
    return Promise.reject(error);
  }
);

export const playerAuth = {
  register: (data) => playerApi.post('/register', data),
  login: (data) => playerApi.post('/login', data),
  logout: () => playerApi.post('/logout'),
  getProfile: () => playerApi.get('/profile'),
  updateProfile: (data) => playerApi.put('/profile', data),
};

export const playerTurf = {
  getTurfs: (params) => playerApi.get('/turfs', { params }),
  getTurf: (id) => playerApi.get(`/turfs/${id}`),
  searchTurfs: (query) => playerApi.get('/turfs/search', { params: { q: query } }),
  getAvailability: (id, date) => playerApi.get(`/turfs/${id}/availability`, { params: { date } }),
};

export default playerApi;