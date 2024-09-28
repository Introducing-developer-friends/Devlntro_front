import axios from "axios";
import { store } from '../redux/store';
import { logout } from '../redux/userSlice';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(logout());
      // 여기서 로그인 페이지로 리다이렉트하는 로직을 추가할 수 있습니다.
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;