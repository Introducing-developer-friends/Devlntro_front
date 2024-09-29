import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './redux/store';
import { setAuthState, setLoading } from './redux/userSlice';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import FeedPage from "./pages/FeedPage";
import FriendsPage from "./pages/FriendsPage";
import FriendsFeedPage from "./pages/FriendsFeedPage";
import MyPage from "./pages/MyPage";
import NavBar from "./components/NavBar";
import CreatePostPage from "./pages/CreatePostPage";
import "./App.css";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, isAuthenticated } = useSelector((state: RootState) => state.user);

  // 컴포넌트가 마운트될 때 로컬 스토리지에서 인증 상태를 확인합니다.
  useEffect(() => {
    const checkAuthState = () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (token && userId) {
        // 로컬 스토리지에 토큰과 userId가 있는 경우 인증 상태를 업데이트
        dispatch(setAuthState({
          isAuthenticated: true,
          userInfo: {
            userId: parseInt(userId),
            token
          }
        }));
      } else {
        // 인증 정보가 없는 경우 인증 상태를 비활성화
        dispatch(setAuthState({ isAuthenticated: false, userInfo: null }));
      }
      // 로딩 상태를 false로 설정
      dispatch(setLoading(false));
    };

    // 로딩 상태를 true로 설정하고 인증 상태를 확인
    dispatch(setLoading(true));
    checkAuthState();
  }, [dispatch]);

  // 로딩 중일 때 로딩 메시지를 표시
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/feed" replace /> : <LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
            <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
            <Route path="/friends-feed/:userId" element={<ProtectedRoute><FriendsFeedPage /></ProtectedRoute>} />
            <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
            <Route path="/create-post" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
          </Routes>
          <NavBar />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;