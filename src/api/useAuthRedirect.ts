import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuthRedirect = (isAuthenticated: boolean) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login'); // 인증되지 않은 경우 로그인 페이지로 리디렉션
    }
  }, [isAuthenticated, navigate]);
};

export default useAuthRedirect;