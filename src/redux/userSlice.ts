import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserInfo {
  userId: number;
  token: string;
  refreshToken: string;  // refreshToken 추가
  name: string;
}

interface UserState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: UserInfo | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  isLoading: false,
  userInfo: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserInfo>) => {
      state.isAuthenticated = true;
      state.userInfo = action.payload;
      state.isLoading = false;
      
      // 토큰들과 사용자 정보 저장
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('userId', action.payload.userId.toString());
      localStorage.setItem('userName', action.payload.name || '알 수 없는 사용자');
    },
    
    // 액세스 토큰만 업데이트하는 리듀서 추가
    updateToken: (state, action: PayloadAction<string>) => {
      if (state.userInfo) {
        state.userInfo.token = action.payload;
        localStorage.setItem('token', action.payload);
      }
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.userInfo = null;
      state.isLoading = false;
      localStorage.clear();
    },

    setAuthState: (state, action: PayloadAction<{ isAuthenticated: boolean; userInfo: UserInfo | null }>) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.userInfo = action.payload.userInfo;
      state.isLoading = false;
    },

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

export const { 
  login, 
  logout, 
  setAuthState, 
  setLoading, 
  updateUserName, 
  updateToken 
} = userSlice.actions;

export default userSlice.reducer;