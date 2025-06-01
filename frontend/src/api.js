import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1', 
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 || error.response?.status === 403) {
      try {
        const newToken = await refreshToken(); 
        localStorage.setItem('token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest); 
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('token'); 
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const refreshToken = async () => {
  const response = await axios.post('http://localhost:8000/api/v1/auth/refresh-token', {
    refreshToken: localStorage.getItem('refresh_token'),
  });
  return response.data.accessToken;
};

export default apiClient;