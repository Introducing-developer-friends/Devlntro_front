import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { login, logout } from '../redux/userSlice';
import { RootState } from "../redux/store";
import { Link, useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [localUsername, setLocalUsername] = useState(''); // 로컬 상태의 이름 변경
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, username } = useSelector(
    (state: RootState) => state.user
  );

  const handleLogin = () => {
    dispatch(login(localUsername)); // Redux에 로컬 상태를 사용하여 로그인
    navigate('/feed'); // 로그인 후 게시물 피드로 이동
  };

  return (
    <div>
      <h1>로그인 페이지</h1>
      {isAuthenticated ? (
        <>
          <span>환영합니다, {username}님</span>
          <button onClick={() => dispatch(logout())}>로그아웃</button>
        </>
      ) : (
        <Link to="/login">로그인</Link>
      )}
        <input
          type="text"
          placeholder="사용자 이름"
          value={localUsername} // 로컬 상태 사용
          onChange={(e) => setLocalUsername(e.target.value)} // 로컬 상태 업데이트
        />
        <button onClick={handleLogin}>로그인</button>
    </div>
  );
};

export default LoginPage;
