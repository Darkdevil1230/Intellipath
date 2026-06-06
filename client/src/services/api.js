import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { classifyApiError } from '../utils/apiErrors';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (!error.config?.skipGlobalErrorToast) {
      const kind = classifyApiError(error);
      if (kind === 'network') {
        toast.error('Network error — please check your connection and try again.');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
