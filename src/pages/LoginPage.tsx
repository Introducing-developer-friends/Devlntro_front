import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "../redux/userSlice";
import { RootState, AppDispatch } from "../redux/store";
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import "./LoginPage.css"; // Import the CSS file

const LoginPage: React.FC = () => {
  const [loginId, setLoginId] = useState(""); // 로그인 시 입력하는 id
  const [password, setPassword] = useState(""); // State for password
  const dispatch = useDispatch<AppDispatch>(); // Dispatch with correct type
  const navigate = useNavigate();

  const { isAuthenticated, userId } = useSelector(
    (state: RootState) => state.user
  );

  const handleLogin = async () => {
    // Add async here
    try {
      const response = await axios.post("/api/auth/login", {
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
              className="login-input"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
