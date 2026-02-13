import axios from 'axios';
import { BASE_URL } from './endpoints';
import { getToken, removeToken } from '../utils/storage';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  async config => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        await removeToken();
      }
    }
    return Promise.reject(error);
  },
);

export default api;
