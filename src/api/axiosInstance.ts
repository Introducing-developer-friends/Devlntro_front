import axios from "axios";
import { store } from '../redux/store';
import { logout, updateToken } from '../redux/userSlice';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// 요청 인터셉터
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

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // 토큰 재발급 요청
        const response = await axios.post(`${baseUrl}/auth/refresh`, {
          refreshToken
        });

        const newToken = response.data.accessToken;
        
        // 새 토큰 저장
        store.dispatch(updateToken(newToken));
        
        // 실패했던 요청의 헤더 업데이트
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        
        // 실패했던 요청 재시도
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;