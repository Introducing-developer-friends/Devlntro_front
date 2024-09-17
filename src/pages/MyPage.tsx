import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const MyPage: React.FC = () => {
  const { username } = useSelector((state: RootState) => state.user);

  return (
    <div>
      <h1>마이페이지</h1>
      <p>사용자 이름: {username}</p>
    </div>
  );
};

export default MyPage;
