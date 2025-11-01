import axios from "axios";

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

const api = axios.create({
  baseURL: isDevelopment ? 'http://localhost:5000/api' : '/api',
  withCredentials: true, // to send cookies with requests
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Skip adding auth header for public routes
    const publicRoutes = ['/auth/login', '/auth/register'];
    if (publicRoutes.some(route => config.url.includes(route))) {
      return config;
    }
    
    // Add auth token for protected routes
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!isDevelopment) {
      // Only redirect in production if no token is found
      window.location.href = '/login';
      return Promise.reject(new Error('No authentication token found'));
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't handle 401 errors in development to allow mock data to work
    if (error.response?.status === 401 && !isDevelopment) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock API responses for development
if (isDevelopment) {
  const originalGet = api.get;
  
  // Override the get method for development
  api.get = async (url, config) => {
    // Mock specific endpoints
    if (url.includes('/leaves/my-leaves')) {
      console.log('Mocking GET request to:', url);
      return Promise.resolve({
        data: {
          data: [
            {
              id: '1',
              employee: { name: 'John Doe', id: '123' },
              leaveType: 'vacation',
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'pending',
              reason: 'Annual vacation',
              createdAt: new Date().toISOString()
            }
          ],
          message: 'Mock leaves data',
          success: true
        }
      });
    }
    
    // For other endpoints, use the original get method
    return originalGet(url, config);
  };
}

export default api;