import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  notificationId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  postId?: number;
  commentId?: number;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(n => n.notificationId === action.payload);
      if (notification) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    deleteNotification: (state, action: PayloadAction<number>) => {
      state.notifications = state.notifications.filter(n => n.notificationId !== action.payload);
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    },
    deleteMultipleNotifications: (state, action: PayloadAction<number[]>) => {
      state.notifications = state.notifications.filter(n => !action.payload.includes(n.notificationId));
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    },
  },
});

export const { setNotifications, markAsRead, deleteNotification, deleteMultipleNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;