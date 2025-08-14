import axios from 'axios';

// Determine the base URL based on environment
const getBaseURL = () => {
  // In development, use the proxy or direct backend URL
  if (import.meta.env.DEV) {
    return 'http://localhost:5088';
  }
  // In production, use relative URLs (same origin)
  return '';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging in development
if (import.meta.env.DEV) {
  api.interceptors.request.use(
    (config) => {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error('[API Response Error]', error.response?.status, error.response?.data);
      return Promise.reject(error);
    }
  );
}
