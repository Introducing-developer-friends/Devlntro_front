import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "../redux/userSlice";
import { RootState, AppDispatch } from "../redux/store";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import axios, { AxiosError } from "axios"; // axios 에러때문에 import
import "./LoginPage.css"; // Import the CSS file

const LoginPage: React.FC = () => {
  const [loginId, setLoginId] = useState(""); // 로그인 시 입력하는 id
  const [password, setPassword] = useState(""); // State for password
  const passwordInputRef = useRef<HTMLInputElement>(null); // password 필드에 접근하기 위한 ref
  const dispatch = useDispatch<AppDispatch>(); // Dispatch with correct type
  const navigate = useNavigate();

  const { isAuthenticated, userId } = useSelector(
    (state: RootState) => state.user
  );

  const handleLogin = async () => {
    console.log("id : ", {loginId})
    console.log("pw : ", {password})
    try {
      const response = await axiosInstance.post("/auth/login", {
        login_id: loginId,
        password: password,
      });

      // 로그인 성공 시 응답에서 userId 추출
      const { userId } = response.data;

      // Redux 상태에 userId 저장
      dispatch(login(userId));

      // 추가적으로 JWT 토큰 저장 (예: 로컬스토리지)
      localStorage.setItem("token", response.data.token);

      // 로그인 성공 시 페이지 이동
      navigate("/feed");
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          "로그인 실패:",
          error.response?.data?.message || error.message
        );
      } else {
        console.error("알 수 없는 오류:", error);
      }
    }
  };

  // 엔터 키를 눌렀을 때 로그인
  const handleKeyPressForLogin = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  // 엔터 키를 눌렀을 때 탭 이동
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
        {isAuthenticated ? (
          <>
            <span>환영합니다, {userId}님</span>
            <button onClick={() => dispatch(logout())}>로그아웃</button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="아이디"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              onKeyDown={handleKeyPressForTab} // 엔터 키 이벤트 추가
              className="login-input"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPressForLogin} // 엔터 키 이벤트 추가
              ref={passwordInputRef}
              className="login-input"
            />
            <button onClick={handleLogin} className="login-button">
              확인
            </button>
            <p className="signup-prompt">
              아직 회원이 아니신가요?{" "}
              <Link to="/signup" className="signup-link">
                회원가입
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
