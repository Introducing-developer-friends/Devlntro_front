import axios from "axios";

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: "localhost:3000", // 백엔드 API의 기본 URL 설정
  timeout: 5000, // 요청 타임아웃 설정 (밀리초 단위)
  headers: {
    "Content-Type": "application/json", // 기본 헤더 설정
    // Authorization: 'Bearer YOUR_TOKEN'  // 필요한 경우 토큰 추가
  },
});

// 요청 인터셉터 추가 (옵션)
axiosInstance.interceptors.request.use(
  (config) => {
    // 요청을 보내기 전에 수행할 작업 추가 가능
    // 예: 토큰을 헤더에 추가하기
    const token = localStorage.getItem("token"); // 예시로 로컬스토리지에서 토큰 가져오기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 요청 오류 처리
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가 (옵션)
axiosInstance.interceptors.response.use(
  (response) => response, // 응답 데이터를 그대로 반환
  (error) => {
    // 응답 오류 처리
    if (error.response && error.response.status === 401) {
      // 예: 인증 오류 처리
      console.error("Unauthorized access - redirecting to login...");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
