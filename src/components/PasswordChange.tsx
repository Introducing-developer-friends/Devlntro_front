import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import './PasswordChange.css';

interface PasswordChangeProps {
  onClose: () => void;
}

const PasswordChange: React.FC<PasswordChangeProps> = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handlePasswordChange = () => {
    axiosInstance.put('/users/password', {
      currentPassword,
      newPassword,
      confirmNewPassword,
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}` }
    })
    .then(response => {
      alert(response.data.message);
      onClose(); // 모달 닫기
    })
    .catch(error => alert(error.response.data.message));
  };

  return (
    <div className="password-change-modal">
        <h2>비밀번호 변경</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        handlePasswordChange();
      }}>
          <input
            type="password"
            placeholder="현재 비밀번호"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="새 비밀번호"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="새 비밀번호 확인"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
        <button type="submit">변경</button>
        </form>
      <button onClick={onClose}>닫기</button>
    </div>
  );
};

export default PasswordChange;
