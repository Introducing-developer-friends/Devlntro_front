import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { login, logout } from '../redux/userSlice';
import { RootState } from "../redux/store";
import { Link, useNavigate } from "react-router-dom";
import './LoginPage.css';  // Import the CSS file

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); // State for password
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  const handleLogin = () => {
    if (username && password) {
      dispatch(login(username)); 
      navigate('/feed'); 
    } else {
      alert('아이디와 비밀번호를 입력하세요.');
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
            <span>환영합니다, {username}님</span>
            <button onClick={() => dispatch(logout())}>로그아웃</button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <button onClick={handleLogin} className="login-button">확인</button>
            <p className="signup-prompt">
              아직 회원이 아니신가요? <Link to="/signup" className="signup-link">회원가입</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
