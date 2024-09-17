import { Link } from 'react-router-dom';

import './NavBar.css';

const NavBar: React.FC = () => {
  

  return (
    <nav className="navbar">
      <Link to="/feed">게시물 피드</Link>
      <Link to="/friends">친구 목록</Link>
      <Link to="/mypage">마이페이지</Link>
    </nav>
  );
};

export default NavBar;
