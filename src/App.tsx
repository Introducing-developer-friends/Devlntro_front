import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
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

const AppWithRouter = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, isAuthenticated } = useSelector((state: RootState) => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthState = () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const lastPath = localStorage.getItem('lastPath');

      if (token && userId) {
        dispatch(setAuthState({
          isAuthenticated: true,
          userInfo: {
            userId: parseInt(userId),
            token
          }
        }));

        // 인증된 상태에서 로그인 페이지나 루트 경로에 있다면 마지막 경로로 이동
        if (location.pathname === '/' || location.pathname === '/login') {
          navigate(lastPath || '/feed', { replace: true });
        }
      } else {
        dispatch(setAuthState({ isAuthenticated: false, userInfo: null }));
        // 인증되지 않은 상태에서 보호된 경로에 있다면 로그인 페이지로 이동
        if (location.pathname !== '/login' && location.pathname !== '/signup') {
          navigate('/login', { replace: true });
        }
      }
      dispatch(setLoading(false));
    };

    dispatch(setLoading(true));
    checkAuthState();
  }, [dispatch, navigate]);

  // 현재 경로 저장 (로그인, 회원가입 페이지 제외)
  useEffect(() => {
    if (location.pathname !== '/login' && location.pathname !== '/signup') {
      localStorage.setItem('lastPath', location.pathname);
    }
  }, [location.pathname]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const showNavBar = isAuthenticated && location.pathname !== '/login' && location.pathname !== '/signup';

  return (
    <div className="App">
      {showNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={
          isAuthenticated ? <Navigate to={localStorage.getItem('lastPath') || "/feed"} replace /> : <Navigate to="/login" replace />
        } />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to={localStorage.getItem('lastPath') || "/feed"} replace /> : <LoginPage />
        } />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
        <Route path="/friends-feed/:userId" element={<ProtectedRoute><FriendsFeedPage /></ProtectedRoute>} />
        <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
        <Route path="/create-post" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppWithRouter />
      </Router>
    </AuthProvider>
  );
}

export default App;