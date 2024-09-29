import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // 로딩 중일 때 로딩 메시지를 표시
  if (isLoading) {
    return <div>Loading...</div>; // 또는 로딩 스피너 컴포넌트로 교체 가능
  }

  // 인증된 상태라면 자식 컴포넌트를 렌더링하고, 그렇지 않으면 로그인 페이지로 리다이렉션합니다.
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;