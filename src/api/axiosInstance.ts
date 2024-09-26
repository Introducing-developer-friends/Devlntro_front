import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Axios 인스턴스 생성
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const axiosInstance = axios.create({
  baseURL: baseUrl, // 백엔드 API의 기본 URL 설정
  timeout: 5000, // 요청 타임아웃 설정 (밀리초 단위)
  headers: {
    "Content-Type": "application/json", // 기본 헤더 설정
  },
});

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // 로컬스토리지에서 토큰 가져오기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized access - redirecting to login...");
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;
