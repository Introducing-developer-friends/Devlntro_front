import React, { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 리덕스에서 인증 상태와 로딩 상태를 가져옵니다.
    const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.user);

  return (
    // 인증 상태와 로딩 상태를 AuthContext에 제공
    <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  // AuthContext가 없으면 에러를 발생
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};