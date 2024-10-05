import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserInfo {
  userId: number;
  token: string;
  name: string;
}

interface UserState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: UserInfo | null;
}

// 초기 상태 설정
const initialState: UserState = {
  isAuthenticated: false,
  isLoading: false,
  userInfo: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 로그인 액션: 인증 상태를 true로 설정하고, 사용자 정보를 저장
    login: (state, action: PayloadAction<UserInfo>) => {
      state.isAuthenticated = true;
      state.userInfo = action.payload;
      state.isLoading = false;
      // 로컬 스토리지에 토큰과 userId를 저장
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('userId', action.payload.userId.toString());
      localStorage.setItem('userName', action.payload.name || '알 수 없는 사용자');
    },
    // 로그아웃 액션: 인증 상태를 false로 설정하고, 사용자 정보를 삭제
    logout: (state) => {
      state.isAuthenticated = false;
      state.userInfo = null;
      state.isLoading = false;
      // 로컬 스토리지에서 토큰과 userId를 제거
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
    },
    // 인증 상태 설정 액션: 초기 로딩 시 로컬 스토리지의 상태를 반영
    setAuthState: (state, action: PayloadAction<{ isAuthenticated: boolean; userInfo: UserInfo | null }>) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.userInfo = action.payload.userInfo;
      state.isLoading = false;
    },
    // 로딩 상태 설정 액션: 로딩 중인지 여부를 설정
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUserName: (state, action: PayloadAction<string>) => {
      if (state.userInfo) {
        state.userInfo.name = action.payload;
        localStorage.setItem('userName', action.payload);
      }
    },
  },
});

export const { login, logout, setAuthState, setLoading, updateUserName } = userSlice.actions;
export default userSlice.reducer;