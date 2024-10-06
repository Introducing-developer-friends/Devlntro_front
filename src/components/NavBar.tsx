import React, { useState, useEffect } from 'react';
import { Link, useLocation  } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { setNotifications, markAsRead, deleteNotification, deleteMultipleNotifications } from '../redux/notificationSlice';
import axiosInstance from '../api/axiosInstance';
import './NavBar.css';

interface Notification {
  notificationId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  postId?: number;
  commentId?: number;
}

const NavBar: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);

  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const location = useLocation();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (isAuthenticated) {
        try {
          const response = await axiosInstance.get('/notifications');
          dispatch(setNotifications(response.data.notifications));
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        }
      }
    };

    if (isAuthenticated) {
      fetchNotifications();
      const intervalId = setInterval(fetchNotifications, 60000); // 1분마다 알림 갱신
      return () => clearInterval(intervalId);
    }
  }, [dispatch, isAuthenticated]);

  const handleNotificationClick = async (notificationId: number) => {
    try {
      await axiosInstance.patch(`/notifications/${notificationId}/read`);
      dispatch(markAsRead(notificationId));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      dispatch(deleteNotification(notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      await axiosInstance.delete('/notifications', {
        data: { notificationIds: notifications.map(n => n.notificationId) }
      });
      dispatch(deleteMultipleNotifications(notifications.map(n => n.notificationId)));
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  // 로그인 페이지에서는 NavBar를 렌더링하지 않음
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <nav className="navbar">
      <Link to="/feed">게시물 피드</Link>
      <Link to="/friends">친구 목록</Link>
      <Link to="/mypage">마이페이지</Link>
      <div className="notification-container">
        <button onClick={() => setShowNotifications(!showNotifications)} className="notification-button">
          알림 {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </button>
        {showNotifications && (
          <div className="notification-dropdown">
            {notifications.length > 0 ? (
              <>
                {notifications.map((notification: Notification) => (
                  <div key={notification.notificationId} className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}>
                    <p onClick={() => handleNotificationClick(notification.notificationId)}>{notification.message}</p>
                    <button onClick={() => handleDeleteNotification(notification.notificationId)}>삭제</button>
                  </div>
                ))}
                <button onClick={handleDeleteAllNotifications} className="delete-all-button">모두 삭제</button>
              </>
            ) : (
              <p>새로운 알림이 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;