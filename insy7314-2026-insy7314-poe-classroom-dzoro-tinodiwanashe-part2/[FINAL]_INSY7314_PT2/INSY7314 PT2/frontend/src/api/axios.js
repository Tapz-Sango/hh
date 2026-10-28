import axios from 'axios';

// Instance pointing directly to the local HTTPS express server
const API = axios.create({
  baseURL: 'https://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});


// REQUEST INTERCEPTOR
// Automatically attach the JWT token to every outgoing request. This is what makes /api/earnings/* work without each component having to pass the token manually. 
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
// Handles global cases like expired tokens so we don't have to duplicate this logic in every component (earnings, bookings, services, etc.).

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 401 = token missing, invalid, or expired → force logout
    if (status === 401) {
      // Only clear + redirect if we actually had a token (i.e., not a login attempt)
      const hadToken = Boolean(localStorage.getItem('token'));

      if (hadToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Avoid redirect loops if we're already on a public page
        const publicPaths = ['/', '/login', '/register'];
        const currentPath = window.location.pathname;

        if (!publicPaths.includes(currentPath)) {
          // Hard reload to reset any in-memory auth state
          window.location.href = '/';
        }
      }
    }

    // 403 = logged in but lacking permission → just bubble up
    return Promise.reject(error);
  }
);

export default API;