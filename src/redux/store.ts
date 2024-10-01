import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';

// 스토어 설정
export const store = configureStore({
  reducer: {
    user: userReducer, // 사용자 상태를 관리하는 리듀서
  },
});

// 스토어 타입 설정
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
