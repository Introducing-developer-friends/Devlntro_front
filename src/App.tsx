import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import FeedPage from "./pages/FeedPage";
import FriendsPage from "./pages/FriendsPage";
import MyPage from "./pages/MyPage";
import NavBar from './components/NavBar';
import "./App.css";
import CreatePostPage from "./pages/CreatePostPage";

function App() {

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/create-post" element={<CreatePostPage />} />
        </Routes>
        <NavBar/>
      </div>
    </Router>
  );
}

export default App;
