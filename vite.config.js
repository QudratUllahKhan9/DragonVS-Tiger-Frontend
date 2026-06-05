import axios from 'axios';

const api = axios.create({
  // Yeh automatically live URL uthayega. Agar live URL nahi mila toh local 4000 port use karega.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

// Agar aapne token ke liye interceptor lagaya hua hai toh wo yahan same rahega
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;