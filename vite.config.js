import axios from 'axios';

// Yahan humne aapke real backend ka link daal diya hai
const api = axios.create({ 
  baseURL: 'https://dragon-vs-tiger-backend.vercel.app/api' 
});

api.interceptors.request.use((config) => {
  // Aapke AuthContext ke mutabiq token ka naam 'dt_token' hai
  const token = localStorage.getItem('dt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;