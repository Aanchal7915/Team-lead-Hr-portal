import axios from 'axios';

const api = axios.create({
  // Use the nested HR Portal URL natively via absolute or relative mounting
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5001/api') + '/hr-portal',

  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Look for both session formats
    const userInfo = localStorage.getItem('userInfo');
    const token = localStorage.getItem('token');
    
    let activeToken = token;
    if (userInfo && !activeToken) {
        try {
            activeToken = JSON.parse(userInfo).token;
        } catch (e) {}
    }

    if (activeToken) {
      config.headers['Authorization'] = `Bearer ${activeToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
