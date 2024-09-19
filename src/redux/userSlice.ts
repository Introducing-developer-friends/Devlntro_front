import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isAuthenticated: boolean;
  userId: number | null; // 사용자 ID를 저장
}

const initialState: UserState = {
  isAuthenticated: false,
  userId: null, // 초기값은 null로 설정
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<number>) => { // 사용자 ID를 받음
      state.isAuthenticated = true;
      state.userId = action.payload; // 로그인 시 사용자 ID 저장
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userId = null; // 로그아웃 시 사용자 ID 제거
    },
  },
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
