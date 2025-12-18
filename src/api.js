import axios from 'axios';

const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  if (window.location.hostname.includes('vercel.app')) {
    return 'https://serverdatn.vercel.app/api';
  }
  
  return 'http://localhost:4000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 
});

api.interceptors.request.use(config => {
  console.log(`Request to: ${config.baseURL}${config.url}`);
  return config;
}, error => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(response => {
  console.log(`Response from: ${response.config.url}`, response.status);
  return response;
}, error => {
  console.error('Response error:', {
    url: error.config?.url,
    status: error.response?.status,
    message: error.message
  });
  
  if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
    console.error('Không thể kết nối đến BE. Kiểm tra:');
    console.error('1. BE có đang chạy không?');
    console.error('2. URL có đúng không?');
    console.error('3. CORS đã cấu hình chưa?');
  }
  
  return Promise.reject(error);
});

export const checkConnection = async () => {
  try {
    const response = await api.get('/health');
    return {
      success: true,
      data: response.data,
      url: `${api.defaults.baseURL}/health`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url: `${api.defaults.baseURL}/health`
    };
  }
};

export default api;