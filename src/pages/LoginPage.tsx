import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../redux/userSlice";
import { RootState, AppDispatch } from "../redux/store";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { AxiosError } from "axios";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  // 로그인 ID, 비밀번호, 에러 메시지, 로딩 상태를 관리하는 state
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // 리덕스에서 인증 상태를 가져옵니다.
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  // 사용자가 이미 인증된 상태라면 피드 페이지로 리다이렉션
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/feed");
    }
  }, [isAuthenticated, navigate]);

  // 로그인 버튼 클릭 시 실행되는 함수
  const handleLogin = async () => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      // 서버에 로그인 요청을 보냅니다.
      const response = await axiosInstance.post("/auth/login", {
        login_id: loginId,
        password: password,
      });

      const { userId, token } = response.data;

      if (userId && token) {
        // 로그인 성공 시 리덕스 상태와 axios 기본 헤더를 업데이트하고 피드 페이지로 이동합니다.
        dispatch(login({ userId: Number(userId), token }));
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        navigate("/feed");
      } else {
        setErrorMessage("Invalid response from server. Please try again.");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        // 에러 발생 시 적절한 에러 메시지를 설정
        setErrorMessage(error.response?.data?.message || "Login failed. Please check your credentials.");
      } else {
        setErrorMessage("An unknown error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키를 눌러 로그인 요청을 보냅니다.
  const handleKeyPressForLogin = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  // Enter 키를 눌러 비밀번호 입력란으로 포커스를 이동
  const handleKeyPressForTab = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }

  return (
    <div className="login-container">
      <div className="welcome-message">
        <h2>안녕하세요!</h2>
        <p>개친소에서 명함을 교환한 사람들의 근황을 확인하고,</p>
        <p>새로운 비즈니스 기회를 포착하세요!</p>
      </div>
      <div className="login-box">
        <h2>Login</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <input
          type="text"
          placeholder="아이디"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          onKeyDown={handleKeyPressForTab}
          className="login-input"
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyPressForLogin}
          ref={passwordInputRef}
          className="login-input"
          disabled={isLoading}
        />
        <button 
          onClick={handleLogin} 
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? "로그인 중..." : "확인"}
        </button>
        <p className="signup-prompt">
          아직 회원이 아니신가요?{" "}
          <Link to="/signup" className="signup-link">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;